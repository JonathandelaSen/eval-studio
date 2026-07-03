import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created, errorResponse } from "@/app/api/_shared/api-responses";
import { evalExecutionModule, evalWorkspaceModule, projectModule } from "@/lib/container";
import { toCreateRunResponse } from "./responses";
import { parseCreateRunRequest } from "./validation";
import { startRunJob } from "@/lib/run-jobs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = parseCreateRunRequest(await request.json());
    if (!parsed.ok) return errorResponse(parsed.error);
    const activeProject = await projectModule.getActiveProject.execute();
    const workspaceRoot = activeProject?.toPrimitives().directory;
    const snapshot = await evalWorkspaceModule.getEvalWorkspace.execute({
      workspaceRoot,
    });
    const snapshotData = snapshot.toPrimitives();
    const selected = new Set(parsed.value.caseIds);
    const cases = snapshotData.cases.filter(
      (item) => item.suiteId === parsed.value.suiteId && selected.has(item.caseId),
    );
    if (cases.length !== selected.size) {
      return errorResponse({
        status: 400,
        code: "invalid_cases",
        message: "Every selected case must belong to the selected suite.",
      });
    }
    const run = await evalExecutionModule.createRun.execute({
      ...parsed.value,
      workspaceRoot,
    });
    startRunJob(run.id.toPrimitives(), async () => {
      try {
        await evalExecutionModule.executeRun.execute({ workspaceRoot, run, cases });
      } catch {
        await evalExecutionModule.interruptRun(workspaceRoot, run);
      }
    });
    return created(toCreateRunResponse(run.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
