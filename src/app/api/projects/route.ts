import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created, errorResponse, ok } from "@/app/api/_shared/api-responses";
import { ProjectDirectoryUnreadableError } from "@/backend/modules/project";
import { projectModule } from "@/lib/container";
import {
  toProjectRegistryResponse,
  toProjectResponse,
} from "./responses";
import { parseCreateProjectRequest } from "./validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const projects = await projectModule.listProjects.execute();
    return ok(
      toProjectRegistryResponse(
        projects.map((project) => project.toPrimitives()),
      ),
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const parsed = parseCreateProjectRequest(await request.json());
    if (!parsed.ok) return errorResponse(parsed.error);
    const project = await projectModule.addProject.execute(parsed.value);
    return created(toProjectResponse(project.toPrimitives()));
  } catch (error: unknown) {
    if (error instanceof ProjectDirectoryUnreadableError) {
      return errorResponse({
        status: 400,
        code: error.code,
        message: error.message,
      });
    }
    return handleApiError(error);
  }
}
