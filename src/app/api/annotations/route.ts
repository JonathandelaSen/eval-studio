import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created, errorResponse } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { toSaveAnnotationResponse } from "./responses";
import { parseSaveAnnotationRequest } from "./validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = parseSaveAnnotationRequest(await request.json());
    if (!parsed.ok) return errorResponse(parsed.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const annotation = await evalWorkspaceModule.saveAnnotation.execute({
      workspaceRoot,
      ...parsed.value,
    });
    return created(toSaveAnnotationResponse(annotation.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
