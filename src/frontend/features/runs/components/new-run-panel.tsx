"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import type { EvalCaseItem } from "../workspace-format";

export function NewRunPanel({
  cases,
  actionId,
  mutations,
}: {
  cases: EvalCaseItem[];
  actionId: string | null;
  mutations: WorkspaceMutations;
}) {
  const [name, setName] = React.useState("");
  const [model, setModel] = React.useState("mock-evaluator");

  const targetAction = actionId ?? cases[0]?.actionId ?? null;
  const targetCases = cases.filter((testCase) => testCase.actionId === targetAction);

  if (targetCases.length === 0 || !targetAction) return null;

  async function startRun() {
    const created = await mutations.createRun({
      name: name.trim() || `${model} ${new Date().toISOString().slice(0, 16)}`,
      actionId: targetAction as string,
      caseIds: targetCases.map((testCase) => testCase.caseId),
      provider: "mock",
      model,
      temperature: 0,
    });
    if (created) setName("");
  }

  return (
    <details className="rounded-lg border bg-card">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground">
        <Play aria-hidden="true" className="size-3.5" />
        {runsLabels.newRun.title}
      </summary>
      <div className="flex flex-col gap-2 border-t px-4 py-3">
        <Input
          aria-label={runsLabels.newRun.nameLabel}
          placeholder={runsLabels.newRun.namePlaceholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          aria-label={runsLabels.newRun.modelLabel}
          value={model}
          onChange={(event) => setModel(event.target.value)}
        />
        <Button
          type="button"
          onClick={startRun}
          disabled={mutations.busy || !model.trim()}
        >
          <Play data-icon="inline-start" />
          {mutations.busy ? runsLabels.newRun.starting : runsLabels.newRun.start}
        </Button>
        <p className="text-center font-mono text-[0.65rem] text-muted-foreground">
          {targetCases.length} {runsLabels.newRun.caseCountSuffix}
        </p>
      </div>
    </details>
  );
}
