import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { errorResponse, ok } from "@/app/api/_shared/api-responses";
import { ProjectNotFoundError } from "@/backend/modules/project";
import { projectModule } from "@/lib/container";
import { toProjectRegistryResponse } from "./responses";
import { parseProjectId } from "./validation";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const parsed = parseProjectId((await params).projectId);
    if (!parsed.ok) return errorResponse(parsed.error);
    const projects = await projectModule.removeProject.execute(parsed.value);
    return ok(
      toProjectRegistryResponse(
        projects.map((project) => project.toPrimitives()),
      ),
    );
  } catch (error: unknown) {
    if (error instanceof ProjectNotFoundError) {
      return errorResponse({
        status: 404,
        code: error.code,
        message: error.message,
      });
    }
    return handleApiError(error);
  }
}
