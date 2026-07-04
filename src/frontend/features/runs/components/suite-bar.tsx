"use client";

import * as React from "react";
import { FolderPlus, Trash2 } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import type { WorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import { nextSuiteIdAfterDelete } from "../suite-selection";
import { NewActionSheet } from "@/frontend/components/shared/new-action-sheet";

export function SuiteBar({
  snapshot,
  suiteId,
  onSelect,
  mutations,
}: {
  snapshot: EvalWorkspaceResponse;
  suiteId: string | null;
  onSelect: (value: string | null) => void;
  mutations: WorkspaceMutations;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault();
    const created = await mutations.createSuite({
      name: name.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
    });
    if (created) {
      setName("");
      setDescription("");
      onSelect(created.suiteId);
      close();
    }
  }

  async function removeSuite() {
    if (!suiteId || !window.confirm(runsLabels.suites.confirmDelete)) return;
    const deleted = await mutations.deleteSuite(suiteId);
    if (deleted) {
      onSelect(nextSuiteIdAfterDelete(snapshot.suites, suiteId));
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
          onChange={(event) => onSelect(event.target.value || null)}
          className="mt-1 block h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground"
          disabled={snapshot.suites.length === 0}
        >
          {snapshot.suites.length === 0 ? <option value="">{runsLabels.suites.none}</option> : null}
          {snapshot.suites.map((suite) => (
            <option key={suite.suiteId} value={suite.suiteId}>{suite.name}</option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label={runsLabels.suites.delete}
        onClick={removeSuite}
        disabled={!suiteId || mutations.busy}
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
        {runsLabels.suites.delete}
      </Button>
      <NewActionSheet
        triggerLabel={runsLabels.suites.new}
        triggerIcon={FolderPlus}
        title={runsLabels.suites.new}
      >
        {(close) => (
          <form onSubmit={(event) => submit(event, close)} className="grid gap-3" aria-label={runsLabels.suites.create}>
            <label className="text-xs font-medium" htmlFor="suite-name">{runsLabels.suites.name}</label>
            <Input id="suite-name" name="name" required value={name} onChange={(event) => setName(event.target.value)} />
            <label className="text-xs font-medium" htmlFor="suite-description">{runsLabels.suites.description} <span className="text-muted-foreground">{runsLabels.suites.optional}</span></label>
            <Input id="suite-description" name="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            <Button type="submit" disabled={mutations.busy}>
              <FolderPlus data-icon="inline-start" /> {runsLabels.suites.create}
            </Button>
          </form>
        )}
      </NewActionSheet>
    </div>
  );
}
