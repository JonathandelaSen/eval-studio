import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created, errorResponse } from "@/app/api/_shared/api-responses";
import { evalExecutionModule, evalWorkspaceModule, projectModule } from "@/lib/container";
import { toCreateRunResponse } from "./responses";
import { parseCreateRunRequest } from "./validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = parseCreateRunRequest(await request.json());
    if (!parsed.ok) return errorResponse(parsed.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const snapshot = await evalWorkspaceModule.getEvalWorkspace.execute({
      workspaceRoot,
    });
    const run = await evalExecutionModule.createRun.execute({
      ...parsed.value,
      workspaceRoot,
      cases: snapshot.toPrimitives().cases,
    });
    return created(toCreateRunResponse(run.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
