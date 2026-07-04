"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { NewActionSheet } from "@/frontend/components/shared/new-action-sheet";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import type { EvalCaseItem } from "../workspace-format";
import { useProviderCatalog } from "../hooks/use-provider-catalog";
import { runsLabels } from "../labels";
import { caseIdsForNewRun } from "../new-run-selection";

function modelKey(providerId: string, modelId: string) {
  return `${providerId}|${modelId}`;
}

export function NewRunSheet({
  testCase,
  suiteId,
  mutations,
}: {
  testCase: EvalCaseItem;
  suiteId: string;
  mutations: WorkspaceMutations;
}) {
  const { providers: catalog, error: catalogError } = useProviderCatalog();
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());
  const [namePrefix, setNamePrefix] = React.useState("");
  const [temperature, setTemperature] = React.useState("0");

  const selections = catalog.flatMap((item) =>
    item.available
      ? item.models
          .filter((model) => selected.has(modelKey(item.id, model.id)))
          .map((model) => ({ provider: item.id, model: model.id }))
      : [],
  );

  function toggleModel(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleProvider(providerId: string) {
    const provider = catalog.find((item) => item.id === providerId);
    if (!provider) return;
    const keys = provider.models.map((model) => modelKey(providerId, model.id));
    setSelected((current) => {
      const next = new Set(current);
      const allSelected = keys.every((key) => next.has(key));
      for (const key of keys) {
        if (allSelected) next.delete(key);
        else next.add(key);
      }
      return next;
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault();
    const parsedTemp = parseFloat(temperature);
    const prefix = namePrefix.trim();
    const stamp = new Date().toISOString().slice(0, 16);
    const created = await mutations.createRuns(
      selections.map(({ provider, model }) => ({
        name: prefix ? `${prefix} — ${model}` : `${model} ${stamp}`,
        suiteId,
        caseIds: caseIdsForNewRun(testCase.caseId),
        provider,
        model,
        temperature: isNaN(parsedTemp) ? 0 : parsedTemp,
      })),
    );
    if (!created) return;
    setNamePrefix("");
    setSelected(new Set());
    close();
  }

  const count = selections.length;
  const startLabel = `${runsLabels.newRun.start} ${count} ${count === 1 ? runsLabels.newRun.runSingular : runsLabels.newRun.runPlural}`;

  return (
    <NewActionSheet
      triggerLabel={runsLabels.newRun.title}
      triggerIcon={Play}
      title={runsLabels.newRun.title}
      triggerClassName="w-full"
    >
      {(close) => (
        <form onSubmit={(event) => submit(event, close)} className="grid gap-3" aria-label={runsLabels.newRun.title}>
          <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            {runsLabels.newRun.caseScope}{" "}
            <strong className="font-medium text-foreground">{testCase.name}</strong>
          </p>
          <label htmlFor="run-name-prefix" className="text-xs font-medium">
            {runsLabels.newRun.nameLabel}{" "}
            <span className="text-muted-foreground">{runsLabels.newRun.nameHint}</span>
          </label>
          <Input
            id="run-name-prefix"
            name="namePrefix"
            placeholder={runsLabels.newRun.namePlaceholder}
            value={namePrefix}
            onChange={(event) => setNamePrefix(event.target.value)}
          />
          <span className="text-xs font-medium">{runsLabels.newRun.modelsLabel}</span>
          {catalog.map((item) => (
            <fieldset key={item.id} className="grid gap-1 rounded-md border p-2">
              <legend className="flex items-center gap-2 px-1 text-xs font-medium">
                {item.label}
                {item.available && item.models.length > 0 ? (
                  <button
                    type="button"
                    className="text-primary underline-offset-2 hover:underline"
                    onClick={() => toggleProvider(item.id)}
                  >
                    {runsLabels.newRun.selectAll}
                  </button>
                ) : null}
              </legend>
              {!item.available ? (
                <p className="px-1 text-xs text-muted-foreground">{item.reason}</p>
              ) : (
                item.models.map((model) => {
                  const key = modelKey(item.id, model.id);
                  return (
                    <label key={key} className="flex min-h-9 items-center gap-2 rounded-md px-1 text-sm hover:bg-muted/50">
                      <input
                        type="checkbox"
                        name="models"
                        value={key}
                        checked={selected.has(key)}
                        onChange={() => toggleModel(key)}
                      />
                      <span>{model.label}</span>
                    </label>
                  );
                })
              )}
            </fieldset>
          ))}
          {catalogError ? <p role="alert" className="text-xs text-destructive">{catalogError}</p> : null}
          <label htmlFor="run-temperature" className="text-xs font-medium">
            {runsLabels.newRun.temperatureLabel}
          </label>
          <Input
            id="run-temperature"
            name="temperature"
            type="number"
            min="0"
            max="2"
            step="0.1"
            required
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
          />
          <Button type="submit" disabled={mutations.busy || count === 0}>
            <Play data-icon="inline-start" /> {startLabel}
          </Button>
        </form>
      )}
    </NewActionSheet>
  );
}
