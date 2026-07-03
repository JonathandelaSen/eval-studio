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
import { ScoreDots } from "./runtime-chip";

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
  const modelName = run.runtime?.model || run.producer;

  return (
    <button
      type="button"
      role="listitem"
      onClick={() => onSelect(run.runId)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border p-2.5 text-left transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/50 bg-card hover:bg-muted/40"
      )}
    >
      <div className="flex-1 min-w-0">
        <span className="block truncate text-xs font-semibold text-foreground">
          {run.name}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <span>{formatDate(run.createdAt)}</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="truncate">{modelName}</span>
        </div>
      </div>
      <div className="shrink-0">
        <ScoreDots score={average} labelWhenEmpty={runsLabels.runs.noScore} />
      </div>
    </button>
  );
}
