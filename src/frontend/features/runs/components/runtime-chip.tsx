import { Cpu } from "lucide-react";
import { cn } from "@/frontend/utils/cn";

type RuntimeLike = {
  provider?: string | null;
  model?: string | null;
  temperature?: number | null;
} | null;

export function RuntimeChip({
  runtime,
  fallback,
  size = "md",
}: {
  runtime: RuntimeLike | undefined;
  fallback?: string;
  size?: "sm" | "md";
}) {
  const provider = runtime?.provider ?? fallback ?? "?";
  const model = runtime?.model ?? "?";
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-stretch overflow-hidden rounded-md border border-primary/40 font-mono",
        size === "sm" ? "text-[0.65rem]" : "text-xs",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1 bg-primary text-primary-foreground",
          size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
        )}
      >
        <Cpu aria-hidden="true" className="size-3" />
        {provider}
      </span>
      <span
        className={cn(
          "flex items-center truncate bg-primary/10 font-medium text-foreground",
          size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
        )}
      >
        {model}
      </span>
      {runtime?.temperature !== null && runtime?.temperature !== undefined ? (
        <span
          className={cn(
            "flex items-center border-l border-primary/30 bg-primary/10 text-muted-foreground",
            size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
          )}
        >
          t{runtime.temperature}
        </span>
      ) : null}
    </span>
  );
}

export function ScoreDots({
  score,
  labelWhenEmpty,
}: {
  score: number | null;
  labelWhenEmpty: string;
}) {
  if (score === null) {
    return (
      <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
        {labelWhenEmpty}
      </span>
    );
  }
  const rounded = Math.round(score);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={cn(
              "size-1.5 rounded-full",
              step <= rounded ? "bg-accent" : "bg-border",
            )}
          />
        ))}
      </span>
      <span className="font-mono text-xs tabular-nums text-foreground">
        {score.toFixed(1)}
      </span>
    </span>
  );
}
