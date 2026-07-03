"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import type { EvalCaseItem } from "../workspace-format";
import { useProviderCatalog } from "../hooks/use-provider-catalog";
import { runsLabels } from "../labels";

export function NewRunPanel({
  cases,
  suiteId,
  mutations,
}: {
  cases: EvalCaseItem[];
  suiteId: string;
  mutations: WorkspaceMutations;
}) {
  const { providers: catalog, error: catalogError } = useProviderCatalog();
  const [provider, setProvider] = React.useState("");
  const [model, setModel] = React.useState("");
  const [name, setName] = React.useState("");
  const [selected, setSelected] = React.useState(() => new Set(cases.map((item) => item.caseId)));

  React.useEffect(() => {
    if (provider || catalog.length === 0) return;
    const first = catalog.find((item) => item.available && item.models.length > 0);
    if (first) { setProvider(first.id); setModel(first.models[0].id); }
  }, [catalog, provider]);

  const activeProvider = catalog.find((item) => item.id === provider);

  function chooseProvider(value: string) {
    const next = catalog.find((item) => item.id === value);
    setProvider(value);
    setModel(next?.models[0]?.id ?? "");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await mutations.createRun({
      name: name.trim() || `${model} ${new Date().toISOString().slice(0, 16)}`,
      suiteId,
      caseIds: [...selected],
      provider,
      model,
      temperature: 0,
    });
    setName("");
  }

  return (
    <details className="rounded-lg border bg-card">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-primary">
        <Play className="size-4" aria-hidden="true" /> {runsLabels.newRun.title}
      </summary>
      <form onSubmit={submit} className="grid gap-3 border-t p-4" aria-label={runsLabels.newRun.start}>
        <label htmlFor="run-name" className="text-xs font-medium">{runsLabels.newRun.nameLabel} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
        <Input id="run-name" name="name" value={name} onChange={(event) => setName(event.target.value)} />
        <fieldset className="grid gap-2">
          <legend className="text-xs font-medium">{runsLabels.newRun.providerLabel}</legend>
          {catalog.map((item) => (
            <label key={item.id} className="flex min-h-10 items-start gap-2 rounded-md border p-2 text-sm">
              <input type="radio" name="provider" value={item.id} checked={provider === item.id} disabled={!item.available} onChange={() => chooseProvider(item.id)} />
              <span>{item.label}{!item.available ? <small className="block text-muted-foreground">{item.reason}</small> : null}</span>
            </label>
          ))}
          {catalogError ? <p role="alert" className="text-xs text-destructive">{catalogError}</p> : null}
        </fieldset>
        <label htmlFor="run-model" className="text-xs font-medium">{runsLabels.newRun.modelLabel}</label>
        <select id="run-model" name="model" required value={model} onChange={(event) => setModel(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
          {(activeProvider?.models ?? []).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <fieldset className="grid gap-1">
          <legend className="text-xs font-medium">{runsLabels.newRun.casesLabel}</legend>
          {cases.map((item) => (
            <label key={item.caseId} className="flex min-h-10 items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.has(item.caseId)} onChange={(event) => setSelected((current) => {
                const next = new Set(current);
                if (event.target.checked) next.add(item.caseId); else next.delete(item.caseId);
                return next;
              })} />
              {item.name}
            </label>
          ))}
        </fieldset>
        <Button type="submit" disabled={mutations.busy || !provider || !model || selected.size === 0}>
          <Play data-icon="inline-start" /> {runsLabels.newRun.start}
        </Button>
      </form>
    </details>
  );
}
