import { AlertCircle } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { runsLabels } from "../labels";

export function DiagnosticsPanel({
  diagnostics,
}: {
  diagnostics: EvalWorkspaceResponse["diagnostics"];
}) {
  if (diagnostics.length === 0) return null;

  return (
    <details className="rounded-lg border border-destructive/40 bg-destructive/5">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-destructive">
        <AlertCircle aria-hidden="true" className="size-3.5" />
        {runsLabels.rail.diagnosticsTitle}
        <span className="ml-auto tabular-nums">{diagnostics.length}</span>
      </summary>
      <ul className="flex flex-col gap-2 px-4 pb-3" role="list">
        {diagnostics.map((diagnostic) => (
          <li
            key={`${diagnostic.path}-${diagnostic.message}`}
            className="rounded-md border bg-card p-2 text-xs"
          >
            <span className="block break-all font-mono font-medium">
              {diagnostic.path}
            </span>
            <span className="text-muted-foreground">{diagnostic.message}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
