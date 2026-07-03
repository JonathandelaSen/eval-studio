"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";

export function NewCasePanel({ suiteId, mutations }: { suiteId: string; mutations: WorkspaceMutations }) {
  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [systemInstruction, setSystemInstruction] = React.useState("");
  const [userMessage, setUserMessage] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await mutations.createCase({
      suiteId,
      name: name.trim(),
      userMessage: userMessage.trim(),
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(systemInstruction.trim() ? { systemInstruction: systemInstruction.trim() } : {}),
    });
    if (created) {
      setName(""); setNote(""); setSystemInstruction(""); setUserMessage("");
    }
  }

  return (
    <details className="rounded-lg border bg-card">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-primary">{runsLabels.newCase.title}</summary>
      <form onSubmit={submit} className="grid gap-2 border-t p-4" aria-label={runsLabels.newCase.create}>
        <label htmlFor="case-name" className="text-xs font-medium">{runsLabels.cases.nameLabel}</label>
        <Input id="case-name" name="name" required value={name} onChange={(event) => setName(event.target.value)} />
        <label htmlFor="case-note" className="text-xs font-medium">{runsLabels.cases.noteLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
        <Input id="case-note" name="note" value={note} onChange={(event) => setNote(event.target.value)} />
        <label htmlFor="case-system" className="text-xs font-medium">{runsLabels.cases.systemInstructionLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
        <Textarea id="case-system" name="systemInstruction" value={systemInstruction} onChange={(event) => setSystemInstruction(event.target.value)} />
        <label htmlFor="case-user" className="text-xs font-medium">{runsLabels.cases.userMessageLabel}</label>
        <Textarea id="case-user" name="userMessage" required value={userMessage} onChange={(event) => setUserMessage(event.target.value)} />
        <Button type="submit" disabled={mutations.busy}>
          <Plus data-icon="inline-start" /> {runsLabels.newCase.create}
        </Button>
      </form>
    </details>
  );
}
