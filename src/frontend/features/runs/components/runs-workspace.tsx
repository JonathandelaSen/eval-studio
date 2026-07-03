"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/frontend/components/ui/tabs";
import { useWorkspaceMutations } from "../hooks/use-workspace-mutations";
import { runsLabels } from "../labels";
import { casesForAction, runsForAction } from "../workspace-format";
import { ActionFilter } from "./action-filter";
import { CaseDetail } from "./case-detail";
import { CaseList } from "./case-list";
import { DiagnosticsPanel } from "./diagnostics-panel";
import { NewRunPanel } from "./new-run-panel";
import { RunDetail } from "./run-detail";
import { RunList } from "./run-list";
import { WorkspaceStrip } from "./workspace-strip";
import { WorkspaceFilesPanel } from "@/frontend/features/workspace-files";

export function RunsWorkspace({ snapshot }: { snapshot: EvalWorkspaceResponse }) {
  const mutations = useWorkspaceMutations();
  const [view, setView] = React.useState("runs");
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [runId, setRunId] = React.useState<string | null>(null);
  const [caseId, setCaseId] = React.useState<string | null>(null);
  const [resultId, setResultId] = React.useState<string | null>(null);

  const runs = runsForAction(snapshot, actionId);
  const cases = casesForAction(snapshot, actionId);
  const activeRun = runs.find((run) => run.runId === runId) ?? runs[0];
  const activeCase =
    cases.find((testCase) => testCase.caseId === caseId) ?? cases[0];

  function selectAction(next: string | null) {
    setActionId(next);
    setRunId(null);
    setCaseId(null);
    setResultId(null);
  }

  function selectRun(next: string) {
    setRunId(next);
    setResultId(null);
  }

  const isEmpty = snapshot.cases.length === 0 && snapshot.runs.length === 0;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-4">
      <WorkspaceStrip snapshot={snapshot} />
      <DiagnosticsPanel diagnostics={snapshot.diagnostics} />
      {mutations.error ? (
        <p className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle aria-hidden="true" className="size-4" />
          {mutations.error}
        </p>
      ) : null}
      <Tabs value={view} onValueChange={setView}>
          <div className="flex flex-wrap items-center gap-3">
            <TabsList>
              <TabsTrigger value="runs">{runsLabels.views.runs}</TabsTrigger>
              <TabsTrigger value="cases">{runsLabels.views.cases}</TabsTrigger>
              <TabsTrigger value="files">{runsLabels.views.files}</TabsTrigger>
            </TabsList>
            {view !== "files" ? (
              <ActionFilter
                snapshot={snapshot}
                selectedActionId={actionId}
                onSelectAction={selectAction}
              />
            ) : null}
          </div>
          <TabsContent value="runs" className="mt-3">
            {isEmpty ? <EmptyWorkspace /> : <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-3">
                <RunList
                  snapshot={snapshot}
                  runs={runs}
                  selectedRunId={activeRun?.runId ?? null}
                  onSelectRun={selectRun}
                />
                <NewRunPanel
                  cases={snapshot.cases}
                  actionId={actionId}
                  mutations={mutations}
                />
              </div>
              {activeRun ? (
                <RunDetail
                  key={activeRun.runId}
                  snapshot={snapshot}
                  run={activeRun}
                  selectedResultId={resultId}
                  onSelectResult={setResultId}
                  mutations={mutations}
                />
              ) : (
                <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                  {runsLabels.empty.noRunSelected}
                </p>
              )}
            </div>}
          </TabsContent>
          <TabsContent value="cases" className="mt-3">
            {isEmpty ? <EmptyWorkspace /> : <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <CaseList
                snapshot={snapshot}
                cases={cases}
                selectedCaseId={activeCase?.caseId ?? null}
                onSelectCase={setCaseId}
              />
              {activeCase ? (
                <CaseDetail
                  key={activeCase.caseId}
                  snapshot={snapshot}
                  testCase={activeCase}
                  mutations={mutations}
                />
              ) : (
                <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                  {runsLabels.empty.noCaseSelected}
                </p>
              )}
            </div>}
          </TabsContent>
          <TabsContent value="files" className="mt-3">
            <WorkspaceFilesPanel active={view === "files"} />
          </TabsContent>
        </Tabs>
    </div>
  );
}

function EmptyWorkspace() {
  return (
    <div className="rounded-lg border border-dashed px-6 py-16 text-center">
      <h2 className="font-serif text-2xl tracking-tight">
        {runsLabels.empty.workspaceTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {runsLabels.empty.workspaceBody}
      </p>
    </div>
  );
}
