"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { LabelBadge } from "@/frontend/components/shared/label-badge";
import { Button } from "@/frontend/components/ui/button";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import {
  averageScore,
  formatDate,
  resultsForRun,
  reviewedCount,
  type EvalRunItem,
} from "../workspace-format";
import { ResultsTable } from "./results-table";
import { ResultReview } from "./result-review";
import { RunEditor } from "./run-editor";
import { RuntimeChip, ScoreDots } from "./runtime-chip";

export function RunDetail({
  snapshot,
  run,
  selectedResultId,
  onSelectResult,
  mutations,
}: {
  snapshot: EvalWorkspaceResponse;
  run: EvalRunItem;
  selectedResultId: string | null;
  onSelectResult: (resultId: string) => void;
  mutations: WorkspaceMutations;
}) {
  const [editing, setEditing] = React.useState(false);
  const results = resultsForRun(snapshot, run.runId);
  const average = averageScore(results, snapshot.annotations);
  const reviewed = reviewedCount(results, snapshot.annotations);
  const fullyReviewed = results.length > 0 && reviewed === results.length;
  const selectedResult =
    results.find((result) => result.resultId === selectedResultId) ?? results[0];

  async function removeRun() {
    if (!window.confirm(runsLabels.runDetail.confirmDelete)) return;
    await mutations.deleteRun(run.runId);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <header className="rounded-lg border bg-card px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="min-w-0 truncate font-serif text-2xl tracking-tight">
            {run.name}
          </h2>
          <LabelBadge variant={fullyReviewed ? "default" : "outline"}>
            {`${reviewed}/${results.length} ${runsLabels.rail.metricReviewed}`}
          </LabelBadge>
          <div className="ml-auto flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={runsLabels.runDetail.edit}
              onClick={() => setEditing((value) => !value)}
            >
              <Pencil aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={runsLabels.runDetail.delete}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={removeRun}
              disabled={mutations.busy}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <RuntimeChip runtime={run.runtime} fallback={run.producer} />
          <ScoreDots score={average} labelWhenEmpty={runsLabels.runs.noScore} />
          <span className="font-mono text-[0.68rem] text-muted-foreground">
            {formatDate(run.createdAt)}
          </span>
        </div>
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
      <section className="rounded-lg border bg-card px-2 py-1">
        <ResultsTable
          snapshot={snapshot}
          results={results}
          selectedResultId={selectedResult?.resultId ?? null}
          onSelectResult={onSelectResult}
        />
      </section>
      {selectedResult ? (
        <ResultReview
          snapshot={snapshot}
          result={selectedResult}
          mutations={mutations}
        />
      ) : null}
    </div>
  );
}
