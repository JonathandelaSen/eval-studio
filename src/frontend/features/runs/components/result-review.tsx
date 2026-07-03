"use client";

import * as React from "react";
import { CircleDot } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { LabelBadge } from "@/frontend/components/shared/label-badge";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { cn } from "@/frontend/utils/cn";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import {
  annotationFor,
  formatJson,
  promptText,
  type EvalResultItem,
} from "../workspace-format";
import { ResultSpotlight } from "./result-spotlight";
import { TechnicalDetails } from "./technical-details";

export function ResultReview({
  snapshot,
  result,
  mutations,
}: {
  snapshot: EvalWorkspaceResponse;
  result: EvalResultItem;
  mutations: WorkspaceMutations;
}) {
  const testCase = snapshot.cases.find((item) => item.caseId === result.caseId);

  return (
    <div className="flex flex-col gap-3">
      <ResultSpotlight testCase={testCase} result={result} />
      <AnnotationForm
        key={result.resultId}
        snapshot={snapshot}
        result={result}
        mutations={mutations}
      />
      <TechnicalDetails
        entries={[
          {
            key: "prompt",
            title: runsLabels.technical.promptPanel,
            value: promptText(result.renderedPrompt),
          },
          {
            key: "variables",
            title: runsLabels.technical.variablesPanel,
            value: formatJson(
              result.promptVariables ?? testCase?.promptVariables ?? null,
            ),
          },
          {
            key: "raw",
            title: runsLabels.technical.rawPanel,
            value: formatJson({
              result,
              case: testCase ?? null,
              annotation: annotationFor(snapshot, result.resultId) ?? null,
            }),
          },
        ]}
      />
    </div>
  );
}

function AnnotationForm({
  snapshot,
  result,
  mutations,
}: {
  snapshot: EvalWorkspaceResponse;
  result: EvalResultItem;
  mutations: WorkspaceMutations;
}) {
  const annotation = annotationFor(snapshot, result.resultId);
  const [score, setScore] = React.useState<number | null>(
    annotation?.score ?? null,
  );
  const [comment, setComment] = React.useState(annotation?.comment ?? "");
  const [tags, setTags] = React.useState((annotation?.tags ?? []).join(", "));

  async function persist() {
    if (score === null) return;
    await mutations.saveAnnotation({
      resultId: result.resultId,
      caseId: result.caseId,
      runId: result.runId,
      score,
      comment: comment.trim() || undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        annotation ? "bg-card" : "border-accent/50 bg-accent/5",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
          {runsLabels.review.scoreTitle}
        </h3>
        <LabelBadge variant={annotation ? "secondary" : "default"}>
          {annotation
            ? runsLabels.review.reviewedBadge
            : runsLabels.review.pendingBadge}
        </LabelBadge>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div
          className="inline-flex overflow-hidden rounded-md border"
          role="radiogroup"
          aria-label={runsLabels.review.scoreLabel}
        >
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={score === value}
              onClick={() => setScore(value)}
              className={cn(
                "px-3.5 py-1.5 font-mono text-sm tabular-nums transition-colors hover:bg-muted",
                score === value &&
                  "bg-accent text-accent-foreground hover:bg-accent",
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <Input
          aria-label={runsLabels.review.tagsLabel}
          placeholder={runsLabels.review.tagsPlaceholder}
          className="min-w-40 flex-1"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
        <Button
          type="button"
          onClick={persist}
          disabled={mutations.busy || score === null}
        >
          <CircleDot data-icon="inline-start" />
          {mutations.busy ? runsLabels.review.saving : runsLabels.review.save}
        </Button>
      </div>
      <Textarea
        aria-label={runsLabels.review.commentLabel}
        placeholder={runsLabels.review.commentPlaceholder}
        className="mt-2"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
    </div>
  );
}
