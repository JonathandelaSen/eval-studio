import { redirect } from "next/navigation";
import { CasesView } from "@/frontend/features/runs/components/cases-view";
import { suiteCasesPath } from "@/frontend/features/runs/routes";
import { getWorkspaceContext } from "@/app/(workspace)/workspace-context";

export const dynamic = "force-dynamic";

export default async function CasePage({
  params,
}: {
  params: Promise<{ suiteId: string; caseId: string }>;
}) {
  const { suiteId, caseId } = await params;
  const { snapshot } = await getWorkspaceContext();
  const exists = snapshot.cases.some(
    (testCase) => testCase.caseId === caseId && testCase.suiteId === suiteId,
  );
  if (!exists) {
    redirect(suiteCasesPath(suiteId));
  }
  return <CasesView suiteId={suiteId} caseId={caseId} />;
}
