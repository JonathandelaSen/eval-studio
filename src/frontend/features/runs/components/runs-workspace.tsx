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
import { casesForSuite, runsForCase, runsForSuite } from "../workspace-format";
import { CaseDetail } from "./case-detail";
import { CaseList } from "./case-list";
import { DiagnosticsPanel } from "./diagnostics-panel";
import { NewRunPanel } from "./new-run-panel";
import { RunDetail } from "./run-detail";
import { RunCaseFilter } from "./run-case-filter";
import { RunList } from "./run-list";
import { WorkspaceFilesPanel } from "@/frontend/features/workspace-files";
import { SuiteBar } from "./suite-bar";
import { NewCasePanel } from "./new-case-panel";
import { useRouter } from "next/navigation";

export function RunsWorkspace({ snapshot }: { snapshot: EvalWorkspaceResponse }) {
  const mutations = useWorkspaceMutations();
  const router = useRouter();
  const [view, setView] = React.useState("runs");
  const [suiteId, setSuiteId] = React.useState<string | null>(snapshot.suites[0]?.suiteId ?? null);
  const [runId, setRunId] = React.useState<string | null>(null);
  const [caseId, setCaseId] = React.useState<string | null>(null);
  const [resultId, setResultId] = React.useState<string | null>(null);

  const suiteRuns = runsForSuite(snapshot, suiteId);
  const cases = casesForSuite(snapshot, suiteId);
  const activeCase =
    cases.find((testCase) => testCase.caseId === caseId) ?? cases[0];
  const runs = runsForCase(suiteRuns, activeCase?.caseId ?? null);
  const activeRun = runs.find((run) => run.runId === runId) ?? runs[0];

  function selectSuite(next: string | null) {
    setSuiteId(next);
    setRunId(null);
    setCaseId(null);
    setResultId(null);
  }

  function selectRun(next: string) {
    setRunId(next);
    setResultId(null);
  }

  function selectCase(next: string) {
    setCaseId(next);
    setRunId(null);
    setResultId(null);
  }

  function inspectCase(nextCaseId: string) {
    setCaseId(nextCaseId);
    setView("cases");
  }

  React.useEffect(() => {
    if (!snapshot.runs.some((run) => run.status === "queued" || run.status === "running")) return;
    const interval = window.setInterval(() => router.refresh(), 1200);
    return () => window.clearInterval(interval);
  }, [router, snapshot.runs]);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-4">
      <DiagnosticsPanel diagnostics={snapshot.diagnostics} />
      <SuiteBar snapshot={snapshot} suiteId={suiteId} onSelect={selectSuite} mutations={mutations} />
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
          </div>
          <TabsContent value="runs" className="mt-3">
            {!suiteId ? <EmptyWorkspace /> : <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-3">
                <RunCaseFilter
                  cases={cases}
                  selectedCaseId={activeCase?.caseId ?? null}
                  onSelectCase={selectCase}
                />
                <RunList
                  snapshot={snapshot}
                  runs={runs}
                  selectedRunId={activeRun?.runId ?? null}
                  onSelectRun={selectRun}
                />
                {cases.length > 0 ? <NewRunPanel cases={cases} suiteId={suiteId} mutations={mutations} /> : <NewCasePanel suiteId={suiteId} mutations={mutations} />}
              </div>
              {activeRun ? (
                <RunDetail
                  key={activeRun.runId}
                  snapshot={snapshot}
                  run={activeRun}
                  selectedResultId={resultId}
                  onSelectResult={setResultId}
                  mutations={mutations}
                  onSelectCase={inspectCase}
                />
              ) : (
                <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                  {runsLabels.empty.noRunSelected}
                </p>
              )}
            </div>}
          </TabsContent>
          <TabsContent value="cases" className="mt-3">
            {!suiteId ? <EmptyWorkspace /> : <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-3">
                <CaseList snapshot={snapshot} cases={cases} selectedCaseId={activeCase?.caseId ?? null} onSelectCase={selectCase} />
                <NewCasePanel suiteId={suiteId} mutations={mutations} />
              </div>
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
      <h2 className="font-sans text-xl font-bold tracking-tight text-foreground/90">
        {runsLabels.empty.workspaceTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {runsLabels.empty.workspaceBody}
      </p>
    </div>
  );
}
