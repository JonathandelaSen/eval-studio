"use client";

import { Clock, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/frontend/utils/cn";
import type { EvalRunStatusPrimitives } from "@/backend/modules/eval-execution/domain/value-objects/eval-run-status.value-object";

interface RunStatusBadgeProps {
  status: EvalRunStatusPrimitives;
  className?: string;
}

export function RunStatusBadge({ status, className }: RunStatusBadgeProps) {
  const displayStatus = status.replaceAll("_", " ");

  switch (status) {
    case "running":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 animate-glow-pulse shadow-[0_0_2px_rgba(14,165,233,0.05)]",
            className
          )}
        >
          <span className="relative flex size-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-1.5 bg-sky-500"></span>
          </span>
          {displayStatus}
        </span>
      );

    case "queued":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-slow-pulse",
            className
          )}
        >
          <Clock className="size-2.5 shrink-0" />
          {displayStatus}
        </span>
      );

    case "completed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide bg-secondary/60 text-muted-foreground border border-border/50 select-none",
            className
          )}
        >
          {displayStatus}
        </span>
      );

    case "completed_with_failures":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 select-none",
            className
          )}
        >
          <XCircle className="size-2.5 shrink-0 text-red-500" />
          {displayStatus}
        </span>
      );

    case "interrupted":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide bg-secondary/40 text-muted-foreground/80 border border-border/40 select-none",
            className
          )}
        >
          <AlertCircle className="size-2.5 shrink-0" />
          {displayStatus}
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide bg-secondary text-muted-foreground border border-border/50",
            className
          )}
        >
          {displayStatus}
        </span>
      );
  }
}
