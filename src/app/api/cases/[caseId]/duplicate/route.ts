import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created, errorResponse } from "@/app/api/_shared/api-responses";
import { toCreateCaseResponse } from "@/app/api/cases/responses";
import { parseCaseId } from "@/app/api/cases/[caseId]/validation";
import { evalWorkspaceModule, projectModule } from "@/lib/container";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const parsed = parseCaseId((await params).caseId);
    if (!parsed.ok) return errorResponse(parsed.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const duplicate = await evalWorkspaceModule.duplicateCase.execute({
      workspaceRoot: activeProject?.toPrimitives().directory,
      caseId: parsed.value.caseId,
    });
    return created(toCreateCaseResponse(duplicate.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
