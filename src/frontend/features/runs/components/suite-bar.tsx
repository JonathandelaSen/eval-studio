"use client";

import * as React from "react";
import { FolderPlus } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";

export function SuiteBar({
  snapshot,
  suiteId,
  onSelect,
  mutations,
}: {
  snapshot: EvalWorkspaceResponse;
  suiteId: string | null;
  onSelect: (value: string) => void;
  mutations: WorkspaceMutations;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await mutations.createSuite({
      name: name.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
    });
    if (created) {
      setName("");
      setDescription("");
      onSelect(created.suiteId);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
      <label className="min-w-64 flex-1 text-xs font-medium text-muted-foreground" htmlFor="suite-select">
        {runsLabels.suites.label}
        <select
          id="suite-select"
          name="suiteId"
          value={suiteId ?? ""}
          onChange={(event) => onSelect(event.target.value)}
          className="mt-1 block h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground"
          disabled={snapshot.suites.length === 0}
        >
          {snapshot.suites.length === 0 ? <option value="">{runsLabels.suites.none}</option> : null}
          {snapshot.suites.map((suite) => (
            <option key={suite.suiteId} value={suite.suiteId}>{suite.name}</option>
          ))}
        </select>
      </label>
      <details className="min-w-72 flex-1">
        <summary className="cursor-pointer text-sm font-medium text-primary">{runsLabels.suites.new}</summary>
        <form onSubmit={submit} className="mt-2 grid gap-2" aria-label={runsLabels.suites.create}>
          <label className="text-xs font-medium" htmlFor="suite-name">{runsLabels.suites.name}</label>
          <Input id="suite-name" name="name" required value={name} onChange={(event) => setName(event.target.value)} />
          <label className="text-xs font-medium" htmlFor="suite-description">{runsLabels.suites.description} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
          <Input id="suite-description" name="description" value={description} onChange={(event) => setDescription(event.target.value)} />
          <Button type="submit" disabled={mutations.busy}>
            <FolderPlus data-icon="inline-start" /> {runsLabels.suites.create}
          </Button>
        </form>
      </details>
    </div>
  );
}
