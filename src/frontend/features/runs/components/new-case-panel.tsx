"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import { NewActionSheet } from "@/frontend/components/shared/new-action-sheet";

export function NewCasePanel({
  suiteId,
  mutations,
  open,
  onOpenChange,
}: {
  suiteId: string;
  mutations: WorkspaceMutations;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [expectedOutput, setExpectedOutput] = React.useState("");
  const [systemInstruction, setSystemInstruction] = React.useState("");
  const [userMessage, setUserMessage] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault();
    const created = await mutations.createCase({
      suiteId,
      name: name.trim(),
      userMessage: userMessage.trim(),
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(expectedOutput.trim() ? { expectedOutput: expectedOutput.trim() } : {}),
      ...(systemInstruction.trim() ? { systemInstruction: systemInstruction.trim() } : {}),
    });
    if (created) {
      setName(""); setNote("");
      setExpectedOutput("");
      setSystemInstruction(""); setUserMessage("");
      close();
    }
  }

  return (
    <NewActionSheet
      triggerLabel={runsLabels.newCase.title}
      triggerIcon={Plus}
      title={runsLabels.newCase.title}
      triggerClassName="w-full"
      open={open}
      onOpenChange={onOpenChange}
    >
      {(close) => (
        <form onSubmit={(event) => submit(event, close)} className="grid gap-2" aria-label={runsLabels.newCase.create}>
          <label htmlFor="case-name" className="text-xs font-medium">{runsLabels.cases.nameLabel}</label>
          <Input id="case-name" name="name" required value={name} onChange={(event) => setName(event.target.value)} />
          <label htmlFor="case-note" className="text-xs font-medium">{runsLabels.cases.noteLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
          <Input id="case-note" name="note" value={note} onChange={(event) => setNote(event.target.value)} />
          <label htmlFor="case-expected-output" className="text-xs font-medium">{runsLabels.cases.expectedOutputLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
          <Textarea
            id="case-expected-output"
            name="expectedOutput"
            className="min-h-28"
            placeholder={runsLabels.cases.expectedOutputPlaceholder}
            value={expectedOutput}
            onChange={(event) => setExpectedOutput(event.target.value)}
          />
          <label htmlFor="case-system" className="text-xs font-medium">{runsLabels.cases.systemInstructionLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
          <Textarea id="case-system" name="systemInstruction" value={systemInstruction} onChange={(event) => setSystemInstruction(event.target.value)} />
          <label htmlFor="case-user" className="text-xs font-medium">{runsLabels.cases.userMessageLabel}</label>
          <Textarea id="case-user" name="userMessage" required value={userMessage} onChange={(event) => setUserMessage(event.target.value)} />
          <Button type="submit" disabled={mutations.busy}>
            <Plus data-icon="inline-start" /> {runsLabels.newCase.create}
          </Button>
        </form>
      )}
    </NewActionSheet>
  );
}
