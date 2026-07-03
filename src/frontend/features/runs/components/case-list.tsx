import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import {
  averageScore,
  resultsForCase,
  type EvalCaseItem,
} from "../workspace-format";
import { ScoreDots } from "./runtime-chip";

export function CaseList({
  snapshot,
  cases,
  selectedCaseId,
  onSelectCase,
}: {
  snapshot: EvalWorkspaceResponse;
  cases: EvalCaseItem[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <header className="border-b px-4 pb-3 pt-4">
        <h2 className="font-serif text-lg tracking-tight">
          {runsLabels.cases.listTitle}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {runsLabels.cases.listHint}
        </p>
      </header>
      <div className="flex flex-col gap-1.5 p-2" role="list">
        {cases.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            {runsLabels.cases.empty}
          </p>
        ) : null}
        {cases.map((testCase) => (
          <CaseCard
            key={testCase.caseId}
            snapshot={snapshot}
            testCase={testCase}
            selected={testCase.caseId === selectedCaseId}
            onSelect={onSelectCase}
          />
        ))}
      </div>
    </div>
  );
}

function CaseCard({
  snapshot,
  testCase,
  selected,
  onSelect,
}: {
  snapshot: EvalWorkspaceResponse;
  testCase: EvalCaseItem;
  selected: boolean;
  onSelect: (caseId: string) => void;
}) {
  const results = resultsForCase(snapshot, testCase.caseId);
  const average = averageScore(results, snapshot.annotations);

  return (
    <button
      type="button"
      role="listitem"
      onClick={() => onSelect(testCase.caseId)}
      className={cn(
        "rounded-md border bg-background p-3 text-left transition-colors hover:bg-muted",
        selected && "border-primary bg-primary/5",
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="block min-w-0 truncate text-sm font-medium">
          {testCase.name}
        </span>
        <ScoreDots score={average} labelWhenEmpty="" />
      </span>
      {testCase.note ? (
        <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
          {testCase.note}
        </span>
      ) : null}
      <span className="mt-2 block font-mono text-[0.65rem] tabular-nums text-muted-foreground">
        {results.length} {runsLabels.cases.resultsSuffix}
      </span>
    </button>
  );
}
