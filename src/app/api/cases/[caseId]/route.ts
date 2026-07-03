import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { errorResponse, ok } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { toDeleteCaseResponse, toUpdateCaseResponse } from "./responses";
import { parseCaseId, parseUpdateCaseRequest } from "./validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const parsedId = parseCaseId((await params).caseId);
    if (!parsedId.ok) return errorResponse(parsedId.error);
    const parsedBody = parseUpdateCaseRequest(await request.json());
    if (!parsedBody.ok) return errorResponse(parsedBody.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const evalCase = await evalWorkspaceModule.updateCase.execute({
      workspaceRoot,
      caseId: parsedId.value.caseId,
      ...parsedBody.value,
    });
    return ok(toUpdateCaseResponse(evalCase.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const parsed = parseCaseId((await params).caseId);
    if (!parsed.ok) return errorResponse(parsed.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const deleted = await evalWorkspaceModule.deleteCase.execute({
      workspaceRoot,
      caseId: parsed.value.caseId,
    });
    return ok(toDeleteCaseResponse(deleted.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
