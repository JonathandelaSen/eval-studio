import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import {
  averageScore,
  formatDate,
  resultsForRun,
  statusCounts,
  type EvalRunItem,
} from "../workspace-format";
import { RuntimeChip, ScoreDots } from "./runtime-chip";

export function RunList({
  snapshot,
  runs,
  selectedRunId,
  onSelectRun,
}: {
  snapshot: EvalWorkspaceResponse;
  runs: EvalRunItem[];
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <header className="border-b px-4 pb-3 pt-4">
        <h2 className="font-serif text-lg tracking-tight">
          {runsLabels.runs.listTitle}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {runsLabels.runs.listHint}
        </p>
      </header>
      <div className="flex flex-col gap-1.5 p-2" role="list">
        {runs.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            {runsLabels.runs.empty}
          </p>
        ) : null}
        {runs.map((run) => (
          <RunCard
            key={run.runId}
            snapshot={snapshot}
            run={run}
            selected={run.runId === selectedRunId}
            onSelect={onSelectRun}
          />
        ))}
      </div>
    </div>
  );
}

function RunCard({
  snapshot,
  run,
  selected,
  onSelect,
}: {
  snapshot: EvalWorkspaceResponse;
  run: EvalRunItem;
  selected: boolean;
  onSelect: (runId: string) => void;
}) {
  const results = resultsForRun(snapshot, run.runId);
  const counts = statusCounts(results);
  const average = averageScore(results, snapshot.annotations);
  const total = results.length;

  return (
    <button
      type="button"
      role="listitem"
      onClick={() => onSelect(run.runId)}
      className={cn(
        "rounded-md border bg-background p-3 text-left transition-colors hover:bg-muted",
        selected && "border-primary bg-primary/5",
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{run.name}</span>
          <span className="mt-0.5 block font-mono text-[0.65rem] text-muted-foreground">
            {formatDate(run.createdAt)}
          </span>
        </span>
        <ScoreDots score={average} labelWhenEmpty={runsLabels.runs.noScore} />
      </span>
      <span className="mt-2 flex items-center gap-2">
        <RuntimeChip runtime={run.runtime} fallback={run.producer} size="sm" />
        <span className="ml-auto font-mono text-[0.65rem] tabular-nums text-muted-foreground">
          {total} {runsLabels.runs.resultsSuffix}
        </span>
      </span>
      {total > 0 ? (
        <span
          aria-hidden="true"
          className="mt-2 flex h-1 overflow-hidden rounded-full bg-border"
        >
          <span
            className="bg-primary"
            style={{ width: `${(counts.completed / total) * 100}%` }}
          />
          <span
            className="bg-destructive"
            style={{ width: `${(counts.failed / total) * 100}%` }}
          />
        </span>
      ) : null}
    </button>
  );
}
