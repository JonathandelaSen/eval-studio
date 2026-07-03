import { Cpu, Star } from "lucide-react";
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
        "inline-flex max-w-full items-center overflow-hidden rounded-md border border-border/80 bg-muted/30 font-mono text-muted-foreground select-none",
        size === "sm" ? "text-[0.65rem] px-1.5 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5",
      )}
    >
      <Cpu aria-hidden="true" className="size-3 text-primary/70 shrink-0" />
      <span className="font-semibold text-primary">{provider}</span>
      <span className="text-muted-foreground/30 font-sans">/</span>
      <span className="font-bold text-foreground truncate">{model}</span>
      {runtime?.temperature !== null && runtime?.temperature !== undefined ? (
        <>
          <span className="text-muted-foreground/30 font-sans">|</span>
          <span className="text-[10px] font-medium text-muted-foreground">
            t={runtime.temperature}
          </span>
        </>
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
    if (!labelWhenEmpty) return null;
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/40 select-none">
        <Star className="size-3 text-muted-foreground/40" />
        <span>-</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 select-none">
      <Star className="size-3 fill-amber-500 text-amber-500" />
      <span>{score.toFixed(1)}</span>
    </span>
  );
}
