import { redirect } from "next/navigation";
import { RunsView } from "@/frontend/features/runs/components/runs-view";
import { caseRunsPath, suiteCasesPath } from "@/frontend/features/runs/routes";
import { getWorkspaceContext } from "@/app/(workspace)/workspace-context";

export const dynamic = "force-dynamic";

export default async function RunPage({
  params,
}: {
  params: Promise<{ suiteId: string; caseId: string; runId: string }>;
}) {
  const { suiteId, caseId, runId } = await params;
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
  return (
    <RunsView suiteId={suiteId} caseId={caseId} runId={runId} resultId={null} />
  );
}
