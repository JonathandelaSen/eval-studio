import { Braces } from "lucide-react";
import { runsLabels } from "../labels";
import { EvidenceGrid, type EvidenceEntry } from "./evidence-panels";

export function TechnicalDetails({ entries }: { entries: EvidenceEntry[] }) {
  return (
    <details className="group rounded-lg border">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground">
        <Braces aria-hidden="true" className="size-3.5" />
        {runsLabels.technical.summary}
      </summary>
      <div className="border-t p-3">
        <EvidenceGrid
          entries={entries}
          emptyLabel={runsLabels.review.emptyValue}
        />
      </div>
    </details>
  );
}
