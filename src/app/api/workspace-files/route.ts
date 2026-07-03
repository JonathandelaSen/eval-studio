import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { ok } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { toListWorkspaceFilesResponse } from "./responses";
import { parseListWorkspaceFilesRequest } from "./validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    parseListWorkspaceFilesRequest();
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const files = await evalWorkspaceModule.listWorkspaceJsonFiles.execute({
      workspaceRoot,
    });
    return ok(toListWorkspaceFilesResponse(files.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
