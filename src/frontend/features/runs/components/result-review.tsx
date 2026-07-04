"use client";

import * as React from "react";
import {
  CircleDot,
  XCircle,
} from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { cn } from "@/frontend/utils/cn";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import {
  annotationFor,
  promptText,
  readableText,
  criteriaList,
  type EvalResultItem,
} from "../workspace-format";
import { CopyButton } from "./copy-button";
import { ResultTechnicalDetails } from "./result-technical-details";

export function ResultReview({
  snapshot,
  result,
  mutations,
}: {
  snapshot: EvalWorkspaceResponse;
  result: EvalResultItem;
  mutations: WorkspaceMutations;
  onSelectCase?: (caseId: string) => void;
  results?: EvalResultItem[];
  onSelectResult?: (resultId: string) => void;
}) {
  const testCase = snapshot.cases.find((item) => item.caseId === result.caseId);
  const failed = result.status === "failed";
  const output = result.parsedOutput ?? result.rawOutput;
  const outputText = readableText(output)?.trim() ?? "";
  const expectedText = testCase?.expectedOutput ? (readableText(testCase.expectedOutput)?.trim() ?? "") : "";
  const criteria = criteriaList(testCase?.expectedOutput);
  
  const promptTextVal = promptText(result.renderedPrompt) ?? "";
  const fallbackInput = testCase?.input ? (readableText(testCase.input)?.trim() ?? "") : "";
  const displayPrompt = promptTextVal || fallbackInput;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col rounded-lg border bg-card/60 shadow-sm min-h-[350px] max-h-[420px]">
          <header className="flex items-center justify-between border-b px-4 py-2 bg-muted/20 select-none">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {runsLabels.review.promptPanel}
            </span>
            {displayPrompt && <CopyButton text={displayPrompt} />}
          </header>
          <div className="p-4 flex-1 overflow-y-auto text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
            {displayPrompt ? (
              displayPrompt
            ) : (
              <span className="text-xs text-muted-foreground italic">{runsLabels.review.emptyPrompt}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-lg border bg-emerald-500/[0.01] border-emerald-500/10 shadow-sm min-h-[350px] max-h-[420px]">
          <header className="flex items-center justify-between border-b border-emerald-500/10 px-4 py-2 bg-emerald-500/[0.04] select-none">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {runsLabels.review.expectedPanel}
            </span>
            {expectedText && <CopyButton text={expectedText} />}
          </header>
          <div className="p-4 flex-1 overflow-y-auto font-sans text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {expectedText ? (
              expectedText
            ) : (
              <span className="text-xs text-muted-foreground italic">{runsLabels.review.emptyExpected}</span>
            )}
          </div>
          {criteria.length > 0 && (
            <footer className="border-t border-emerald-500/10 p-3 bg-emerald-500/[0.02]">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                {runsLabels.spotlight.criteriaLabel}
              </span>
              <ul className="flex flex-col gap-1 text-[11px] text-muted-foreground list-disc pl-4" role="list">
                {criteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
            </footer>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col rounded-lg border shadow-sm min-h-[350px] max-h-[420px]",
            failed
              ? "bg-destructive/[0.01] border-destructive/10"
              : "bg-blue-500/[0.01] border-blue-500/10"
          )}
        >
          <header
            className={cn(
              "flex items-center justify-between border-b px-4 py-2 select-none",
              failed
                ? "border-destructive/10 bg-destructive/[0.04]"
                : "border-blue-500/10 bg-blue-500/[0.04]"
            )}
          >
            <span
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-wider",
                failed ? "text-destructive" : "text-blue-600 dark:text-blue-400"
              )}
            >
              {failed ? runsLabels.review.errorTitle : runsLabels.review.outputPanel}
            </span>
            {!failed && outputText && <CopyButton text={outputText} />}
          </header>
          <div className="p-4 flex-1 overflow-y-auto text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
            {failed ? (
              <div className="flex items-start gap-2 text-destructive text-xs">
                <XCircle className="size-4 shrink-0 mt-0.5" />
                <span>{readableText(result.error) || runsLabels.spotlight.emptyOutput}</span>
              </div>
            ) : outputText ? (
              outputText
            ) : (
              <span className="text-xs text-muted-foreground italic font-sans font-sans">{runsLabels.spotlight.emptyOutput}</span>
            )}
          </div>
        </div>
      </div>

      <AnnotationForm
        key={result.resultId}
        snapshot={snapshot}
        result={result}
        mutations={mutations}
      />

      <ResultTechnicalDetails
        result={result}
        testCase={testCase}
        annotation={annotationFor(snapshot, result.resultId) ?? null}
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
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-2 mb-3">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {runsLabels.review.scoreTitle}
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border",
            annotation
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          )}
        >
          {annotation
            ? runsLabels.review.reviewedBadge
            : runsLabels.review.pendingBadge}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">{runsLabels.review.scoreLabel}</span>
          <div
            className="flex gap-1.5"
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
                  "flex-1 py-1.5 rounded-md border text-center font-mono text-sm font-semibold transition-all duration-200",
                  score === value
                    ? "bg-primary border-primary text-primary-foreground shadow-sm scale-[1.03]"
                    : "bg-muted/30 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">{runsLabels.review.commentLabel}</span>
          <Textarea
            aria-label={runsLabels.review.commentLabel}
            placeholder={runsLabels.review.commentPlaceholder}
            className="min-h-[60px] max-h-[120px] text-xs resize-y"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">{runsLabels.review.tagsLabel}</span>
            <Input
              aria-label={runsLabels.review.tagsLabel}
              placeholder={runsLabels.review.tagsPlaceholder}
              className="h-8 text-xs font-sans"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 px-4 text-xs font-medium shrink-0"
            onClick={persist}
            disabled={mutations.busy || score === null}
          >
            <CircleDot className={cn("size-3.5 mr-1.5", mutations.busy && "animate-pulse")} />
            {mutations.busy ? runsLabels.review.saving : runsLabels.review.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
