"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import { formatJson, parseJsonObjectField, type EvalCaseItem } from "../workspace-format";

type JsonFieldsState = {
  input: string;
  expectedOutput: string;
  inputError: string | null;
  expectedOutputError: string | null;
};

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
  const [jsonFields, setJsonFields] = React.useReducer(
    (current: JsonFieldsState, patch: Partial<JsonFieldsState>) => ({ ...current, ...patch }),
    {
      input: formatJson(testCase.input),
      expectedOutput: formatJson(testCase.expectedOutput),
      inputError: null,
      expectedOutputError: null,
    },
  );
  const promptMessages = Array.isArray(testCase.renderedPrompt.messages)
    ? testCase.renderedPrompt.messages as Array<Record<string, unknown>>
    : [];
  const [systemInstruction, setSystemInstruction] = React.useState(
    String(promptMessages.find((item) => item.role === "system")?.content ?? ""),
  );
  const [userMessage, setUserMessage] = React.useState(
    String(promptMessages.find((item) => item.role === "user")?.content ?? testCase.renderedPrompt.text ?? ""),
  );

  async function persist(event: React.FormEvent<HTMLFormElement>) {
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
    const trimmedNote = note.trim();
    const updated = await mutations.updateCase(testCase.caseId, {
      name: name.trim(),
      note: trimmedNote ? trimmedNote : null,
      input: parsedInput ?? null,
      expectedOutput: parsedExpectedOutput ?? null,
      systemInstruction: systemInstruction.trim(),
      userMessage: userMessage.trim(),
    });
    if (updated) onClose();
  }

  return (
    <form onSubmit={persist} className="flex flex-col gap-2 rounded-md border border-primary/40 bg-primary/5 p-3">
      <label htmlFor={`case-name-${testCase.caseId}`} className="text-xs font-medium">{runsLabels.cases.nameLabel}</label>
      <Input
        id={`case-name-${testCase.caseId}`}
        name="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <label htmlFor={`case-note-${testCase.caseId}`} className="text-xs font-medium">{runsLabels.cases.noteLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
      <Textarea
        id={`case-note-${testCase.caseId}`}
        name="note"
        placeholder={runsLabels.cases.notePlaceholder}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <label htmlFor={`case-input-${testCase.caseId}`} className="text-xs font-medium">{runsLabels.cases.inputLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
      <Textarea
        id={`case-input-${testCase.caseId}`}
        name="input"
        className="min-h-28 font-mono text-xs"
        placeholder={runsLabels.cases.inputPlaceholder}
        value={jsonFields.input}
        aria-invalid={jsonFields.inputError ? true : undefined}
        aria-describedby={jsonFields.inputError ? `case-input-error-${testCase.caseId}` : undefined}
        onChange={(event) => setJsonFields({ input: event.target.value, inputError: null })}
      />
      {jsonFields.inputError && <p id={`case-input-error-${testCase.caseId}`} role="alert" className="text-xs text-destructive">{jsonFields.inputError}</p>}
      <label htmlFor={`case-expected-output-${testCase.caseId}`} className="text-xs font-medium">{runsLabels.cases.expectedOutputLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
      <Textarea
        id={`case-expected-output-${testCase.caseId}`}
        name="expectedOutput"
        className="min-h-28 font-mono text-xs"
        placeholder={runsLabels.cases.expectedOutputPlaceholder}
        value={jsonFields.expectedOutput}
        aria-invalid={jsonFields.expectedOutputError ? true : undefined}
        aria-describedby={jsonFields.expectedOutputError ? `case-expected-output-error-${testCase.caseId}` : undefined}
        onChange={(event) => setJsonFields({ expectedOutput: event.target.value, expectedOutputError: null })}
      />
      {jsonFields.expectedOutputError && <p id={`case-expected-output-error-${testCase.caseId}`} role="alert" className="text-xs text-destructive">{jsonFields.expectedOutputError}</p>}
      <label htmlFor={`case-system-${testCase.caseId}`} className="text-xs font-medium">{runsLabels.cases.systemInstructionLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
      <Textarea id={`case-system-${testCase.caseId}`} name="systemInstruction" value={systemInstruction} onChange={(event) => setSystemInstruction(event.target.value)} />
      <label htmlFor={`case-user-${testCase.caseId}`} className="text-xs font-medium">{runsLabels.cases.userMessageLabel}</label>
      <Textarea id={`case-user-${testCase.caseId}`} name="userMessage" required value={userMessage} onChange={(event) => setUserMessage(event.target.value)} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X data-icon="inline-start" />
          {runsLabels.cases.cancel}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={mutations.busy}
        >
          <Check data-icon="inline-start" />
          {mutations.busy ? runsLabels.cases.saving : runsLabels.cases.save}
        </Button>
      </div>
    </form>
  );
}
