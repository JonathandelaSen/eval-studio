"use client";

import { Timer } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import {
  averageScore,
  formatDate,
  formatLatency,
  resultsForRun,
  totalLatency,
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
  const elapsed = totalLatency(results);

  return (
    <div
      role="listitem"
      className={cn(
        "relative rounded-lg border p-2.5 text-left transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/50 bg-card hover:bg-muted/40"
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(run.runId)}
        aria-label={`${runsLabels.runs.select} ${run.name}`}
        className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <div className="pointer-events-none relative flex flex-col gap-2">
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
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground"
              title={runsLabels.runs.elapsed}
            >
              <Timer aria-hidden="true" className="size-3" />
              {formatLatency(elapsed)}
            </span>
            <RuntimeChip runtime={run.runtime} fallback={run.producer} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
