import { FolderOpen } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { runsLabels } from "../labels";
import { reviewedShare } from "../workspace-format";

export function WorkspaceStrip({ snapshot }: { snapshot: EvalWorkspaceResponse }) {
  const reviewed = reviewedShare(snapshot);
  const counters = [
    { value: snapshot.suites.length, label: runsLabels.rail.metricSuites },
    { value: snapshot.cases.length, label: runsLabels.rail.metricCases },
    { value: snapshot.runs.length, label: runsLabels.rail.metricRuns },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-card px-4 py-2">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <FolderOpen aria-hidden="true" className="size-3.5 shrink-0" />
        <span
          className="truncate font-mono text-[0.68rem]"
          title={snapshot.workspaceRoot ?? undefined}
        >
          {snapshot.workspaceRoot ?? runsLabels.rail.noProject}
        </span>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-3 font-mono text-[0.68rem] text-muted-foreground">
        {counters.map((counter) => (
          <span key={counter.label} className="flex items-baseline gap-1">
            <span className="font-semibold tabular-nums text-foreground">
              {counter.value}
            </span>
            {counter.label}
          </span>
        ))}
        <span className="flex items-baseline gap-1 border-l pl-3">
          <span className="font-semibold tabular-nums text-primary">
            {reviewed === null ? "-" : `${reviewed}%`}
          </span>
          {runsLabels.rail.metricReviewed}
        </span>
      </span>
    </div>
  );
}
