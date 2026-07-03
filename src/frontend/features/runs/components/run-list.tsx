"use client";

import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import {
  averageScore,
  formatDate,
  resultsForRun,
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
    <div className="flex flex-col gap-1.5" role="list">
      {runs.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground bg-card">
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
  const average = averageScore(results, snapshot.annotations);

  return (
    <button
      type="button"
      role="listitem"
      onClick={() => onSelect(run.runId)}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/50 bg-card hover:bg-muted/40"
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span className="truncate text-xs font-semibold text-foreground">
          {run.name}
        </span>
        <div className="shrink-0">
          <ScoreDots score={average} labelWhenEmpty={runsLabels.runs.noScore} />
        </div>
      </div>
      <span className="w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
        {run.status.replaceAll("_", " ")}
      </span>
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-muted-foreground select-none">
          {formatDate(run.createdAt)}
        </span>
        <RuntimeChip runtime={run.runtime} fallback={run.producer} size="sm" />
      </div>
    </button>
  );
}
