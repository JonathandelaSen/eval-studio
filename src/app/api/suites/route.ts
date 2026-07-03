import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { toCreateSuiteResponse } from "./responses";
import { createSuiteRequestSchema } from "./validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = createSuiteRequestSchema.parse(await request.json());
    const active = await projectModule.getActiveProject.execute();
    const suite = await evalWorkspaceModule.createSuite.execute({
      workspaceRoot: active?.toPrimitives().directory,
      ...body,
    });
    return created(toCreateSuiteResponse(suite.toPrimitives()));
  } catch (error) {
    return handleApiError(error);
  }
}
