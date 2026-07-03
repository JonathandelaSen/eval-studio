import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { errorResponse, ok } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import {
  toSaveWorkspaceFileResponse,
  toWorkspaceFileContentResponse,
} from "./responses";
import {
  parseReadWorkspaceFileRequest,
  parseSaveWorkspaceFileRequest,
} from "./validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const parsed = parseReadWorkspaceFileRequest(new URL(request.url).searchParams);
    if (!parsed.ok) return errorResponse(parsed.error);
    const workspaceRoot = await activeWorkspaceRoot();
    const file = await evalWorkspaceModule.getWorkspaceJsonFile.execute({
      workspaceRoot,
      path: parsed.value.path,
    });
    return ok(toWorkspaceFileContentResponse(file.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const parsed = parseSaveWorkspaceFileRequest(await request.json());
    if (!parsed.ok) return errorResponse(parsed.error);
    const workspaceRoot = await activeWorkspaceRoot();
    const file = await evalWorkspaceModule.saveWorkspaceJsonFile.execute({
      workspaceRoot,
      ...parsed.value,
    });
    return ok(toSaveWorkspaceFileResponse(file.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

async function activeWorkspaceRoot() {
  const activeProject = await projectModule.getActiveProject.execute();
  return activeProject?.toPrimitives().directory;
}
