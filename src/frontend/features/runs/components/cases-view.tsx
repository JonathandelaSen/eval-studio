"use client";

import { useRouter } from "next/navigation";
import { casesForSuite } from "../workspace-format";
import { casePath, suiteCasesPath } from "../routes";
import { runsLabels } from "../labels";
import { useWorkspace } from "./workspace-provider";
import { CaseList } from "./case-list";
import { CaseDetail } from "./case-detail";
import { NewCasePanel } from "./new-case-panel";

export function CasesView({
  suiteId,
  caseId,
}: {
  suiteId: string;
  caseId: string | null;
}) {
  const router = useRouter();
  const { snapshot, mutations } = useWorkspace();
  const cases = casesForSuite(snapshot, suiteId);
  const activeCase = cases.find((testCase) => testCase.caseId === caseId) ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <CaseList
          snapshot={snapshot}
          cases={cases}
          selectedCaseId={activeCase?.caseId ?? null}
          onSelectCase={(id) => router.push(casePath(suiteId, id))}
        />
        <NewCasePanel suiteId={suiteId} mutations={mutations} />
      </div>
      {activeCase ? (
        <CaseDetail
          key={activeCase.caseId}
          snapshot={snapshot}
          testCase={activeCase}
          mutations={mutations}
          onDeleted={() => router.push(suiteCasesPath(suiteId))}
        />
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {runsLabels.empty.noCaseSelected}
        </p>
      )}
    </div>
  );
}
