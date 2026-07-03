import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { ok } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { toEvalWorkspaceResponse } from "./responses";
import { parseWorkspaceRequest } from "./validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    parseWorkspaceRequest();
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const snapshot = await evalWorkspaceModule.getEvalWorkspace.execute({
      workspaceRoot,
    });
    return ok(toEvalWorkspaceResponse(snapshot.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
