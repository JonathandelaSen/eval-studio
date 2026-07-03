import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created, errorResponse } from "@/app/api/_shared/api-responses";
import { evalExecutionModule, evalWorkspaceModule, projectModule } from "@/lib/container";
import { startRunJob } from "@/lib/run-jobs";
import { toCreateRunResponse } from "../../responses";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const active = await projectModule.getActiveProject.execute();
    const workspaceRoot = active?.toPrimitives().directory;
    const snapshot = (await evalWorkspaceModule.getEvalWorkspace.execute({ workspaceRoot })).toPrimitives();
    const { runId } = await params;
    const source = snapshot.runs.find((run) => run.runId === runId);
    if (!source || !source.runtime) {
      return errorResponse({ status: 404, code: "run_not_found", message: "Run not found." });
    }
    const completed = new Set(snapshot.results.filter((item) => item.runId === source.runId).map((item) => item.caseId));
    const caseIds = source.caseIds.filter((caseId) => !completed.has(caseId));
    if (caseIds.length === 0) {
      return errorResponse({ status: 400, code: "nothing_to_retry", message: "This run has no missing cases." });
    }
    const cases = snapshot.cases.filter((item) => caseIds.includes(item.caseId));
    const run = await evalExecutionModule.createRun.execute({
      workspaceRoot,
      name: `Retry ${source.name}`,
      suiteId: source.suiteId,
      caseIds,
      provider: source.runtime.provider,
      model: source.runtime.model,
      ...(source.runtime.temperature === null ? {} : { temperature: source.runtime.temperature }),
    });
    startRunJob(run.id.toPrimitives(), async () => {
      try { await evalExecutionModule.executeRun.execute({ workspaceRoot, run, cases }); }
      catch { await evalExecutionModule.interruptRun(workspaceRoot, run); }
    });
    return created(toCreateRunResponse(run.toPrimitives()));
  } catch (error) {
    return handleApiError(error);
  }
}
