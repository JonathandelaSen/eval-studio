"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { Button } from "@/frontend/components/ui/button";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import {
  criteriaList,
  formatDate,
  formatJson,
  promptText,
  readableText,
  type EvalCaseItem,
} from "../workspace-format";
import { CaseEditor } from "./case-editor";
import { CaseHistory } from "./case-history";
import { TechnicalDetails } from "./technical-details";
import { ValueBlock } from "./result-spotlight";
import { ZoneLabel } from "./zone-label";

export function CaseDetail({
  snapshot,
  testCase,
  mutations,
}: {
  snapshot: EvalWorkspaceResponse;
  testCase: EvalCaseItem;
  mutations: WorkspaceMutations;
}) {
  const [editing, setEditing] = React.useState(false);
  const expectedText = readableText(testCase.expectedOutput)?.trim();
  const criteria = criteriaList(testCase.expectedOutput);

  async function removeCase() {
    if (!window.confirm(runsLabels.cases.confirmDelete)) return;
    await mutations.deleteCase(testCase.caseId);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <header className="rounded-lg border bg-card px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="min-w-0 truncate font-sans text-base font-bold tracking-tight text-foreground/90">
            {testCase.name}
          </h2>
          <span className="font-mono text-[0.68rem] text-muted-foreground select-none">
            {formatDate(testCase.createdAt)}
          </span>
          <div className="ml-auto flex shrink-0 gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] font-medium border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1"
              aria-label={runsLabels.cases.edit}
              onClick={() => setEditing((value) => !value)}
            >
              <Pencil className="size-3" />
              <span>Edit</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] font-medium border-red-200 hover:border-red-500 bg-red-500/[0.02] dark:bg-red-500/[0.01] hover:bg-red-500/10 text-red-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1"
              aria-label={runsLabels.cases.delete}
              onClick={removeCase}
              disabled={mutations.busy}
            >
              <Trash2 className="size-3" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
        {editing ? (
          <div className="mt-3">
            <CaseEditor
              key={testCase.caseId}
              testCase={testCase}
              mutations={mutations}
              onClose={() => setEditing(false)}
            />
          </div>
        ) : testCase.note ? (
          <p className="mt-3 border-l-2 border-accent/60 pl-3 text-sm text-muted-foreground">
            {testCase.note}
          </p>
        ) : null}
      </header>
      <div className="overflow-hidden rounded-lg border bg-card">
        <section className="border-b bg-muted/50 px-5 py-4">
          <ZoneLabel tone="muted">{runsLabels.spotlight.inputLabel}</ZoneLabel>
          <ValueBlock
            value={testCase.input}
            emptyLabel={runsLabels.spotlight.emptyInput}
            className="mt-1.5 text-sm leading-relaxed text-foreground/90"
          />
        </section>
        <section className="bg-accent/5 px-5 py-4">
          <ZoneLabel tone="accent">{runsLabels.spotlight.expectedLabel}</ZoneLabel>
          {expectedText ? (
            <p className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
              {expectedText}
            </p>
          ) : (
            <ValueBlock
              value={testCase.expectedOutput}
              emptyLabel={runsLabels.spotlight.emptyOutput}
              className="mt-2 text-sm"
            />
          )}
          {criteria.length > 0 ? (
            <ul
              className="mt-3 flex flex-col gap-1 border-t border-accent/30 pt-2 text-xs text-muted-foreground"
              role="list"
            >
              {criteria.map((criterion) => (
                <li key={criterion} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent">
                    -
                  </span>
                  {criterion}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
      <CaseHistory snapshot={snapshot} testCase={testCase} />
      <TechnicalDetails
        entries={[
          {
            key: "template",
            title: runsLabels.technical.templatePanel,
            value: testCase.promptTemplate
              ? promptText(testCase.promptTemplate)
              : promptText(testCase.renderedPrompt),
          },
          {
            key: "variables",
            title: runsLabels.technical.variablesPanel,
            value: formatJson(testCase.promptVariables ?? null),
          },
          {
            key: "raw",
            title: runsLabels.technical.rawPanel,
            value: formatJson(testCase),
          },
        ]}
      />
    </div>
  );
}
