"use client";

import { useRouter } from "next/navigation";
import {
  casesForSuite,
  runsForCase,
  runsForSuite,
} from "../workspace-format";
import {
  caseRunsPath,
  casePath,
  resultPath,
  runPath,
} from "../routes";
import { runsLabels } from "../labels";
import { useWorkspace } from "./workspace-provider";
import { RunCaseFilter } from "./run-case-filter";
import { RunList } from "./run-list";
import { RunDetail } from "./run-detail";
import { NewRunSheet } from "./new-run-sheet";
import { NewCasePanel } from "./new-case-panel";

export function RunsView({
  suiteId,
  caseId,
  runId,
  resultId,
}: {
  suiteId: string;
  caseId: string;
  runId: string | null;
  resultId: string | null;
}) {
  const router = useRouter();
  const { snapshot, mutations } = useWorkspace();
  const cases = casesForSuite(snapshot, suiteId);
  const activeCase =
    cases.find((testCase) => testCase.caseId === caseId) ?? null;
  const suiteRuns = runsForSuite(snapshot, suiteId);
  const runs = runsForCase(suiteRuns, activeCase?.caseId ?? null);
  const activeRun = runs.find((run) => run.runId === runId) ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <RunCaseFilter
          cases={cases}
          selectedCaseId={activeCase?.caseId ?? null}
          onSelectCase={(id) => router.push(caseRunsPath(suiteId, id))}
        />
        <RunList
          snapshot={snapshot}
          runs={runs}
          selectedRunId={activeRun?.runId ?? null}
          onSelectRun={(id) => router.push(runPath(suiteId, caseId, id))}
        />
        {activeCase ? (
          <NewRunSheet testCase={activeCase} suiteId={suiteId} mutations={mutations} />
        ) : (
          <NewCasePanel suiteId={suiteId} mutations={mutations} />
        )}
      </div>
      {activeRun ? (
        <RunDetail
          key={activeRun.runId}
          snapshot={snapshot}
          run={activeRun}
          selectedResultId={resultId}
          onSelectResult={(nextResultId) =>
            router.push(resultPath(suiteId, caseId, activeRun.runId, nextResultId))
          }
          mutations={mutations}
          onSelectCase={(nextCaseId) =>
            router.push(casePath(suiteId, nextCaseId))
          }
          onDeleted={() => router.push(caseRunsPath(suiteId, caseId))}
        />
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {runsLabels.empty.noRunSelected}
        </p>
      )}
    </div>
  );
}
