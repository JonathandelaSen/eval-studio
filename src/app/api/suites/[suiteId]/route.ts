import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { errorResponse, ok } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { toDeleteSuiteResponse } from "./responses";
import { parseSuiteId } from "./validation";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ suiteId: string }> },
) {
  try {
    const parsed = parseSuiteId((await params).suiteId);
    if (!parsed.ok) return errorResponse(parsed.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const deleted = await evalWorkspaceModule.deleteSuite.execute({
      workspaceRoot,
      suiteId: parsed.value.suiteId,
    });
    return ok(toDeleteSuiteResponse(deleted.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
