import { runsLabels } from "../labels";

export function EmptyWorkspace() {
  return (
    <div className="rounded-lg border border-dashed px-6 py-16 text-center">
      <h2 className="font-sans text-xl font-bold tracking-tight text-foreground/90">
        {runsLabels.empty.workspaceTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {runsLabels.empty.workspaceBody}
      </p>
    </div>
  );
}
