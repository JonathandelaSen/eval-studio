import { ArrowDown, CheckCheck, XCircle } from "lucide-react";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import {
  criteriaList,
  formatLatency,
  readableText,
  recordEntries,
  type EvalCaseItem,
  type EvalResultItem,
} from "../workspace-format";
import { RuntimeChip } from "./runtime-chip";
import { ZoneLabel } from "./zone-label";

export function ResultSpotlight({
  testCase,
  result,
}: {
  testCase: EvalCaseItem | undefined;
  result: EvalResultItem;
}) {
  const failed = result.status === "failed";
  const output = result.parsedOutput ?? result.rawOutput;
  const expected = testCase?.expectedOutput;
  const criteria = criteriaList(expected);
  const outputText = readableText(output)?.trim();
  const expectedText = readableText(expected)?.trim();
  const exactMatch =
    !failed && !!outputText && !!expectedText && outputText === expectedText;

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <section className="border-b bg-muted/50 px-5 py-4">
        <ZoneLabel tone="muted">{runsLabels.spotlight.inputLabel}</ZoneLabel>
        <ValueBlock
          value={testCase?.input}
          emptyLabel={runsLabels.spotlight.emptyInput}
          className="mt-1.5 text-sm leading-relaxed text-foreground/90"
        />
      </section>
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-2">
        <ArrowDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
        <RuntimeChip
          runtime={result.runtime}
          fallback={result.producer}
          size="sm"
        />
        <span className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
          {formatLatency(result.latencyMs)}
        </span>
        {exactMatch ? (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-primary">
            <CheckCheck aria-hidden="true" className="size-3" />
            {runsLabels.spotlight.matchLabel}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "grid grid-cols-1",
          expected && "md:grid-cols-2 md:divide-x",
        )}
      >
        <section className={cn("px-5 py-4", failed && "bg-destructive/5")}>
          <ZoneLabel tone={failed ? "error" : "primary"}>
            {failed
              ? runsLabels.spotlight.failedLabel
              : runsLabels.spotlight.outputLabel}
          </ZoneLabel>
          {failed ? (
            <p className="mt-2 flex items-start gap-2 text-sm text-destructive">
              <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {readableText(result.error) ?? runsLabels.spotlight.emptyOutput}
            </p>
          ) : (
            <ValueBlock
              value={output}
              emptyLabel={runsLabels.spotlight.emptyOutput}
              className="mt-2 font-sans text-sm leading-relaxed text-foreground/90"
            />
          )}
        </section>
        {expected ? (
          <section className="border-t bg-accent/5 px-5 py-4 md:border-t-0">
            <ZoneLabel tone="accent">
              {runsLabels.spotlight.expectedLabel}
            </ZoneLabel>
            {expectedText ? (
              <p className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {expectedText}
              </p>
            ) : (
              <ValueBlock
                value={expected}
                emptyLabel={runsLabels.spotlight.emptyOutput}
                className="mt-2 text-sm"
              />
            )}
            {criteria.length > 0 ? (
              <ul
                className="mt-3 flex flex-col gap-1 border-t border-accent/30 pt-2 text-xs text-muted-foreground"
                role="list"
              >
                {criteria.map((criterion) => (
                  <li key={criterion} className="flex gap-2">
                    <span aria-hidden="true" className="text-accent">
                      -
                    </span>
                    {criterion}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}

export function ValueBlock({
  value,
  emptyLabel,
  className,
}: {
  value: unknown;
  emptyLabel: string;
  className?: string;
}) {
  const text = readableText(value);
  if (text !== null && text.trim().length > 0) {
    return <p className={cn("whitespace-pre-wrap", className)}>{text}</p>;
  }
  const entries = recordEntries(value);
  if (entries.length === 0) {
    return <p className="mt-1.5 text-xs text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <dl className={cn("grid gap-x-4 gap-y-1", className)}>
      {entries.map((entry) => (
        <div key={entry.key} className="flex items-baseline gap-2">
          <dt className="shrink-0 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            {entry.key}
          </dt>
          <dd className="min-w-0 break-words text-sm">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}
