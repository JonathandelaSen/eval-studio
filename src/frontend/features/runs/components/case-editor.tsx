"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import type { EvalCaseItem } from "../workspace-format";

export function CaseEditor({
  testCase,
  mutations,
  onClose,
}: {
  testCase: EvalCaseItem;
  mutations: WorkspaceMutations;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(testCase.name);
  const [note, setNote] = React.useState(testCase.note ?? "");

  async function persist() {
    const trimmedNote = note.trim();
    const updated = await mutations.updateCase(testCase.caseId, {
      name: name.trim(),
      note: trimmedNote ? trimmedNote : null,
    });
    if (updated) onClose();
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-primary/40 bg-primary/5 p-3">
      <Input
        aria-label={runsLabels.cases.nameLabel}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Textarea
        aria-label={runsLabels.cases.noteLabel}
        placeholder={runsLabels.cases.notePlaceholder}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X data-icon="inline-start" />
          {runsLabels.cases.cancel}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={persist}
          disabled={mutations.busy || !name.trim()}
        >
          <Check data-icon="inline-start" />
          {mutations.busy ? runsLabels.cases.saving : runsLabels.cases.save}
        </Button>
      </div>
    </div>
  );
}
