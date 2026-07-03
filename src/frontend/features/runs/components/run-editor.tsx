"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import type { EvalRunItem } from "../workspace-format";

export function RunEditor({
  run,
  mutations,
  onClose,
}: {
  run: EvalRunItem;
  mutations: WorkspaceMutations;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(run.name);
  const [notes, setNotes] = React.useState(run.notes ?? "");

  async function persist() {
    const trimmedNotes = notes.trim();
    const updated = await mutations.updateRun(run.runId, {
      name: name.trim(),
      notes: trimmedNotes ? trimmedNotes : null,
    });
    if (updated) onClose();
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-primary/40 bg-primary/5 p-3">
      <Input
        aria-label={runsLabels.runDetail.nameLabel}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Textarea
        aria-label={runsLabels.runDetail.notesLabel}
        placeholder={runsLabels.runDetail.notesPlaceholder}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X data-icon="inline-start" />
          {runsLabels.runDetail.cancel}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={persist}
          disabled={mutations.busy || !name.trim()}
        >
          <Check data-icon="inline-start" />
          {mutations.busy
            ? runsLabels.runDetail.saving
            : runsLabels.runDetail.save}
        </Button>
      </div>
    </div>
  );
}
