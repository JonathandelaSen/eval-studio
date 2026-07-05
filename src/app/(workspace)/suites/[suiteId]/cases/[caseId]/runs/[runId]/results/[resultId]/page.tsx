import { redirect } from "next/navigation";
import { RunsView } from "@/frontend/features/runs/components/runs-view";
import { caseRunsPath, runPath, suiteCasesPath } from "@/frontend/features/runs/routes";
import { getWorkspaceContext } from "@/app/(workspace)/workspace-context";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{
    suiteId: string;
    caseId: string;
    runId: string;
    resultId: string;
  }>;
}) {
  const { suiteId, caseId, runId, resultId } = await params;
  const { snapshot } = await getWorkspaceContext();
  const caseExists = snapshot.cases.some(
    (testCase) => testCase.caseId === caseId && testCase.suiteId === suiteId,
  );
  if (!caseExists) {
    redirect(suiteCasesPath(suiteId));
  }
  const run = snapshot.runs.find(
    (candidate) => candidate.runId === runId && candidate.suiteId === suiteId,
  );
  if (!run || !run.caseIds.includes(caseId)) {
    redirect(caseRunsPath(suiteId, caseId));
  }
  const resultExists = snapshot.results.some(
    (result) => result.resultId === resultId && result.runId === runId,
  );
  if (!resultExists) {
    redirect(runPath(suiteId, caseId, runId));
  }
  return (
    <RunsView
      suiteId={suiteId}
      caseId={caseId}
      runId={runId}
      resultId={resultId}
    />
  );
}
