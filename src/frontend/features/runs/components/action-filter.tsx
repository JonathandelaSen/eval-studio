import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import { actionIds } from "../workspace-format";

export function ActionFilter({
  snapshot,
  selectedActionId,
  onSelectAction,
}: {
  snapshot: EvalWorkspaceResponse;
  selectedActionId: string | null;
  onSelectAction: (actionId: string | null) => void;
}) {
  const actions = actionIds(snapshot);
  if (actions.length <= 1) return null;

  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto"
      role="group"
      aria-label={runsLabels.rail.actionsTitle}
    >
      <FilterChip
        label={runsLabels.rail.allActions}
        selected={selectedActionId === null}
        onSelect={() => onSelectAction(null)}
      />
      {actions.map((actionId) => (
        <FilterChip
          key={actionId}
          label={actionId}
          selected={selectedActionId === actionId}
          onSelect={() => onSelectAction(actionId)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={label}
      className={cn(
        "max-w-56 shrink-0 truncate rounded-full border px-3 py-1 font-mono text-[0.68rem] transition-colors hover:bg-muted",
        selected && "border-primary bg-primary/10 text-primary",
      )}
    >
      {label}
    </button>
  );
}
