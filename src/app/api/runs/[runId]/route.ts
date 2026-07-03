import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { errorResponse, ok } from "@/app/api/_shared/api-responses";
import { evalExecutionModule, evalWorkspaceModule, projectModule } from "@/lib/container";
import { toDeleteRunResponse, toUpdateRunResponse } from "./responses";
import { parseRunId, parseUpdateRunRequest } from "./validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const parsedId = parseRunId((await params).runId);
    if (!parsedId.ok) return errorResponse(parsedId.error);
    const parsedBody = parseUpdateRunRequest(await request.json());
    if (!parsedBody.ok) return errorResponse(parsedBody.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const run = await evalExecutionModule.updateRun.execute({
      workspaceRoot,
      runId: parsedId.value.runId,
      ...parsedBody.value,
    });
    return ok(toUpdateRunResponse(run.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const parsed = parseRunId((await params).runId);
    if (!parsed.ok) return errorResponse(parsed.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const deleted = await evalExecutionModule.deleteRun.execute({
      workspaceRoot,
      runId: parsed.value.runId,
    });
    await evalWorkspaceModule.deleteRunAnnotations.execute({
      workspaceRoot,
      runId: parsed.value.runId,
    });
    return ok(toDeleteRunResponse(deleted.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
