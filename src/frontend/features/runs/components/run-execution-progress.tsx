"use client";

import { Clock } from "lucide-react";
import { cn } from "@/frontend/utils/cn";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import type { EvalRunItem } from "../workspace-format";

interface RunExecutionProgressProps {
  snapshot?: EvalWorkspaceResponse;
  run: EvalRunItem;
}

export function RunExecutionProgress({ run }: RunExecutionProgressProps) {
  const isRunning = run.status === "running";

  return (
    <div className="w-full rounded-xl border border-border bg-card/45 p-6 shadow-sm relative overflow-hidden backdrop-blur-sm flex flex-col gap-4">
      {/* Decorative Glow Mesh */}
      <div 
        className={cn(
          "absolute -top-24 -right-24 size-80 rounded-full blur-3xl pointer-events-none opacity-20 transition-colors duration-1000",
          isRunning ? "bg-sky-500" : "bg-amber-500"
        )}
      />
      <div 
        className={cn(
          "absolute -bottom-24 -left-24 size-80 rounded-full blur-3xl pointer-events-none opacity-10 transition-colors duration-1000",
          isRunning ? "bg-sky-500" : "bg-amber-500"
        )}
      />

      {/* Title & Badge Row */}
      <div className="flex items-center justify-between w-full relative z-10">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          {isRunning ? "Executing scenarios" : "Queued for execution"}
        </h3>
        
        {isRunning ? (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 animate-glow-pulse shadow-[0_0_2px_rgba(14,165,233,0.05)]">
            <span className="relative flex size-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-1.5 bg-sky-500"></span>
            </span>
            Running
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-slow-pulse">
            <Clock className="size-2.5 shrink-0" />
            Queued
          </span>
        )}
      </div>

      {/* Indeterminate Progress Bar */}
      <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden relative z-10 border border-border/10">
        <div 
          className={cn(
            "h-full w-1/3 rounded-full animate-indeterminate",
            isRunning ? "bg-sky-500" : "bg-amber-500"
          )}
        />
      </div>
    </div>
  );
}


