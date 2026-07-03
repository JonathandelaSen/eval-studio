import { cn } from "@/frontend/utils/cn";

export type EvidenceEntry = {
  key: string;
  title: string;
  value: string;
  tone?: "default" | "expected" | "error";
};

export function EvidenceGrid({
  entries,
  emptyLabel,
}: {
  entries: EvidenceEntry[];
  emptyLabel: string;
}) {
  const visible = entries.filter((entry) => entry.value.trim().length > 0);
  const columns =
    visible.length >= 3 ? "lg:grid-cols-2 2xl:grid-cols-3" : "lg:grid-cols-2";
  return (
    <div className={cn("grid grid-cols-1 gap-3", columns)}>
      {entries.map((entry) => (
        <EvidencePanel key={entry.key} entry={entry} emptyLabel={emptyLabel} />
      ))}
    </div>
  );
}

export function EvidencePanel({
  entry,
  emptyLabel,
}: {
  entry: EvidenceEntry;
  emptyLabel: string;
}) {
  const tone = entry.tone ?? "default";
  const empty = entry.value.trim().length === 0;
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border",
        tone === "expected" && "border-accent/50",
        tone === "error" && "border-destructive/50",
      )}
    >
      <header
        className={cn(
          "flex items-center gap-2 border-b bg-muted/60 px-3 py-1.5",
          tone === "expected" && "border-accent/40 bg-accent/15",
          tone === "error" && "border-destructive/40 bg-destructive/10",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            tone === "default" && "bg-primary",
            tone === "expected" && "bg-accent",
            tone === "error" && "bg-destructive",
          )}
        />
        <h4 className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {entry.title}
        </h4>
      </header>
      {empty ? (
        <p className="px-3 py-3 text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <pre className="max-h-[420px] min-h-0 flex-1 overflow-auto bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground font-mono">
          <code>{entry.value}</code>
        </pre>
      )}
    </section>
  );
}
