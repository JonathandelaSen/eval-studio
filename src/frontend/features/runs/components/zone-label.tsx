import { cn } from "@/frontend/utils/cn";

export function ZoneLabel({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "muted" | "primary" | "accent" | "error";
}) {
  return (
    <h4
      className={cn(
        "font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em]",
        tone === "muted" && "text-muted-foreground",
        tone === "primary" && "text-primary",
        tone === "accent" && "text-accent-foreground/70 dark:text-accent",
        tone === "error" && "text-destructive",
      )}
    >
      {children}
    </h4>
  );
}
