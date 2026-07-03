import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created } from "@/app/api/_shared/api-responses";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { toCreateCaseResponse } from "./responses";
import { createCaseRequestSchema } from "./validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = createCaseRequestSchema.parse(await request.json());
    const active = await projectModule.getActiveProject.execute();
    const evalCase = await evalWorkspaceModule.createCase.execute({
      workspaceRoot: active?.toPrimitives().directory,
      ...body,
    });
    return created(toCreateCaseResponse(evalCase.toPrimitives()));
  } catch (error) {
    return handleApiError(error);
  }
}
