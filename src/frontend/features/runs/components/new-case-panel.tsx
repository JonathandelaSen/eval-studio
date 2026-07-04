"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import { parseJsonObjectField } from "../workspace-format";

type JsonFieldsState = {
  input: string;
  expectedOutput: string;
  inputError: string | null;
  expectedOutputError: string | null;
};

export function NewCasePanel({ suiteId, mutations }: { suiteId: string; mutations: WorkspaceMutations }) {
  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [jsonFields, setJsonFields] = React.useReducer(
    (current: JsonFieldsState, patch: Partial<JsonFieldsState>) => ({ ...current, ...patch }),
    { input: "", expectedOutput: "", inputError: null, expectedOutputError: null },
  );
  const [systemInstruction, setSystemInstruction] = React.useState("");
  const [userMessage, setUserMessage] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let parsedInput: Record<string, unknown> | undefined;
    let parsedExpectedOutput: Record<string, unknown> | undefined;
    try {
      parsedInput = parseJsonObjectField(jsonFields.input);
      setJsonFields({ inputError: null });
    } catch {
      setJsonFields({ inputError: runsLabels.cases.jsonObjectError });
      return;
    }
    try {
      parsedExpectedOutput = parseJsonObjectField(jsonFields.expectedOutput);
      setJsonFields({ expectedOutputError: null });
    } catch {
      setJsonFields({ expectedOutputError: runsLabels.cases.jsonObjectError });
      return;
    }
    const created = await mutations.createCase({
      suiteId,
      name: name.trim(),
      userMessage: userMessage.trim(),
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(parsedInput ? { input: parsedInput } : {}),
      ...(parsedExpectedOutput ? { expectedOutput: parsedExpectedOutput } : {}),
      ...(systemInstruction.trim() ? { systemInstruction: systemInstruction.trim() } : {}),
    });
    if (created) {
      setName(""); setNote("");
      setJsonFields({ input: "", expectedOutput: "", inputError: null, expectedOutputError: null });
      setSystemInstruction(""); setUserMessage("");
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
        <label htmlFor="case-input" className="text-xs font-medium">{runsLabels.cases.inputLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
        <Textarea
          id="case-input"
          name="input"
          className="min-h-28 font-mono text-xs"
          placeholder={runsLabels.cases.inputPlaceholder}
          value={jsonFields.input}
          aria-invalid={jsonFields.inputError ? true : undefined}
          aria-describedby={jsonFields.inputError ? "case-input-error" : undefined}
          onChange={(event) => setJsonFields({ input: event.target.value, inputError: null })}
        />
        {jsonFields.inputError && <p id="case-input-error" role="alert" className="text-xs text-destructive">{jsonFields.inputError}</p>}
        <label htmlFor="case-expected-output" className="text-xs font-medium">{runsLabels.cases.expectedOutputLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
        <Textarea
          id="case-expected-output"
          name="expectedOutput"
          className="min-h-28 font-mono text-xs"
          placeholder={runsLabels.cases.expectedOutputPlaceholder}
          value={jsonFields.expectedOutput}
          aria-invalid={jsonFields.expectedOutputError ? true : undefined}
          aria-describedby={jsonFields.expectedOutputError ? "case-expected-output-error" : undefined}
          onChange={(event) => setJsonFields({ expectedOutput: event.target.value, expectedOutputError: null })}
        />
        {jsonFields.expectedOutputError && <p id="case-expected-output-error" role="alert" className="text-xs text-destructive">{jsonFields.expectedOutputError}</p>}
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
