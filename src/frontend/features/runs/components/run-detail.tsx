"use client";

import * as React from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Zap, CheckCheck } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { Button } from "@/frontend/components/ui/button";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import { cn } from "@/frontend/utils/cn";
import {
  annotationFor,
  averageScore,
  formatDate,
  resultsForRun,
  reviewedCount,
  readableText,
  formatLatency,
  type EvalRunItem,
} from "../workspace-format";
import { ResultReview } from "./result-review";
import { RunEditor } from "./run-editor";
import { RuntimeChip, ScoreDots } from "./runtime-chip";

export function RunDetail({
  snapshot,
  run,
  selectedResultId,
  onSelectResult,
  mutations,
  onSelectCase,
}: {
  snapshot: EvalWorkspaceResponse;
  run: EvalRunItem;
  selectedResultId: string | null;
  onSelectResult: (resultId: string) => void;
  mutations: WorkspaceMutations;
  onSelectCase?: (caseId: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const results = resultsForRun(snapshot, run.runId);
  const average = averageScore(results, snapshot.annotations);
  const reviewed = reviewedCount(results, snapshot.annotations);
  const fullyReviewed = results.length > 0 && reviewed === results.length;
  const selectedResult =
    results.find((result) => result.resultId === selectedResultId) ?? results[0];
  const currentIndex = selectedResult ? results.findIndex((r) => r.resultId === selectedResult.resultId) : -1;
  const testCase = selectedResult ? snapshot.cases.find((c) => c.caseId === selectedResult.caseId) : undefined;
  const caseName = testCase?.name ?? selectedResult?.caseId ?? "";
  
  const failed = selectedResult?.status === "failed";
  const output = selectedResult ? (selectedResult.parsedOutput ?? selectedResult.rawOutput) : null;
  const outputText = readableText(output)?.trim() ?? "";
  const expectedText = testCase?.expectedOutput ? (readableText(testCase.expectedOutput)?.trim() ?? "") : "";
  const exactMatch = !failed && !!outputText && !!expectedText && outputText === expectedText;

  async function removeRun() {
    if (!window.confirm(runsLabels.runDetail.confirmDelete)) return;
    await mutations.deleteRun(run.runId);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <header className="rounded-lg border bg-card px-5 py-4 flex flex-col gap-3">
        {/* Row 1: Metadata & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <RuntimeChip runtime={run.runtime} fallback={run.producer} />
            <ScoreDots score={average} labelWhenEmpty={runsLabels.runs.noScore} />
            <span className="font-mono text-[0.68rem] text-muted-foreground select-none">
              {formatDate(run.createdAt)}
            </span>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] font-medium border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1"
              aria-label={runsLabels.runDetail.edit}
              onClick={() => setEditing((value) => !value)}
            >
              <Pencil className="size-3" />
              <span>Edit</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] font-medium border-red-200 hover:border-red-500 bg-red-500/[0.02] dark:bg-red-500/[0.01] hover:bg-red-500/10 text-red-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1"
              aria-label={runsLabels.runDetail.delete}
              onClick={removeRun}
              disabled={mutations.busy}
            >
              <Trash2 className="size-3" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Row 2: Run Name */}
        <div className="border-t border-border/40 pt-2.5">
          <h2 className="min-w-0 truncate font-sans text-base font-bold tracking-tight text-foreground/90">
            {run.name}
          </h2>
        </div>

        {/* Row 3: Selected Result Case & Navigation */}
        {selectedResult && currentIndex !== -1 && (
          <div className="border-t border-border/40 pt-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              {/* Pagination Controls */}
              {results.length > 1 && (
                <div className="flex items-center gap-1 bg-muted/30 rounded-md border border-border/45 p-0.5 select-none">
                  <button
                    type="button"
                    disabled={results.length <= 1}
                    onClick={() => onSelectResult(results[(currentIndex - 1 + results.length) % results.length].resultId)}
                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Previous case"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-medium text-muted-foreground/80 px-1">
                    {currentIndex + 1}/{results.length}
                  </span>
                  <button
                    type="button"
                    disabled={results.length <= 1}
                    onClick={() => onSelectResult(results[(currentIndex + 1) % results.length].resultId)}
                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Next case"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
              {results.length > 1 && <span className="text-border">|</span>}

              {/* Case Link */}
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 select-none">Case:</span>
                {onSelectCase ? (
                  <button
                    type="button"
                    onClick={() => onSelectCase(selectedResult.caseId)}
                    className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors text-left"
                  >
                    {caseName}
                  </button>
                ) : (
                  <span className="font-semibold text-foreground">{caseName}</span>
                )}
              </div>
              <span className="text-border">|</span>

              {/* Latency */}
              <div className="flex items-center gap-1.5 font-mono text-[11px] select-none">
                <Zap className="size-3.5 text-muted-foreground/60" />
                <span>{formatLatency(selectedResult.latencyMs)}</span>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 select-none">
              {exactMatch && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCheck className="size-3" />
                  {runsLabels.spotlight.matchLabel}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider border",
                  failed
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {selectedResult.status}
              </span>
            </div>
          </div>
        )}

        {editing ? (
          <div className="mt-3">
            <RunEditor
              key={run.runId}
              run={run}
              mutations={mutations}
              onClose={() => setEditing(false)}
            />
          </div>
        ) : run.notes ? (
          <p className="mt-3 border-l-2 border-accent/60 pl-3 text-sm text-muted-foreground">
            {run.notes}
          </p>
        ) : null}
      </header>
      {selectedResult ? (
        <ResultReview
          snapshot={snapshot}
          result={selectedResult}
          mutations={mutations}
          onSelectCase={onSelectCase}
          results={results}
          onSelectResult={onSelectResult}
        />
      ) : null}
    </div>
  );
}
