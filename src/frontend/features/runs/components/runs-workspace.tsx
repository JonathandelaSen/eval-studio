"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Play,
} from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { LabelBadge } from "@/frontend/components/shared/label-badge";
import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { Textarea } from "@/frontend/components/ui/textarea";

type EvalCase = EvalWorkspaceResponse["cases"][number];
type EvalRun = EvalWorkspaceResponse["runs"][number];
type EvalResult = EvalWorkspaceResponse["results"][number];
type EvalAnnotation = EvalWorkspaceResponse["annotations"][number];

export function RunsWorkspace({ snapshot }: { snapshot: EvalWorkspaceResponse }) {
  const [selectedRunId, setSelectedRunId] = React.useState(
    snapshot.runs[0]?.runId ?? "",
  );
  const [selectedResultId, setSelectedResultId] = React.useState(
    snapshot.results.find((result) => result.runId === selectedRunId)?.resultId ?? "",
  );

  const selectedRun =
    snapshot.runs.find((run) => run.runId === selectedRunId) ?? snapshot.runs[0];
  const runResults = selectedRun
    ? snapshot.results.filter((result) => result.runId === selectedRun.runId)
    : [];
  const selectedResult =
    runResults.find((result) => result.resultId === selectedResultId) ??
    runResults[0];
  const selectedCase = selectedResult
    ? snapshot.cases.find((testCase) => testCase.caseId === selectedResult.caseId)
    : undefined;

  React.useEffect(() => {
    if (!selectedRun) return;
    const firstResult = snapshot.results.find(
      (result) => result.runId === selectedRun.runId,
    );
    setSelectedResultId(firstResult?.resultId ?? "");
  }, [selectedRun?.runId, snapshot.results, selectedRun]);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4">
        <WorkspaceSummary snapshot={snapshot} />
        <Diagnostics snapshot={snapshot} />
        <NewRunPanel snapshot={snapshot} />
        <RunList
          snapshot={snapshot}
          selectedRunId={selectedRun?.runId ?? ""}
          onSelectRun={setSelectedRunId}
        />
      </aside>
      <section className="min-w-0">
        {selectedRun ? (
          <RunDetail
            run={selectedRun}
            results={runResults}
            cases={snapshot.cases}
            annotations={snapshot.annotations}
            selectedResult={selectedResult}
            selectedCase={selectedCase}
            onSelectResult={setSelectedResultId}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No runs found</CardTitle>
              <CardDescription>
                Add a project in Settings or create a mock run from a suite.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </div>
  );
}

function NewRunPanel({ snapshot }: { snapshot: EvalWorkspaceResponse }) {
  const firstAction = snapshot.suites[0]?.actionId ?? snapshot.cases[0]?.actionId ?? "";
  const defaultCaseIds = snapshot.suites[0]?.caseIds ?? snapshot.cases
    .filter((testCase) => testCase.actionId === firstAction)
    .map((testCase) => testCase.caseId);
  const [name, setName] = React.useState("Mock run");
  const [actionId, setActionId] = React.useState(firstAction);
  const [model, setModel] = React.useState("mock-evaluator");
  const [submitting, setSubmitting] = React.useState(false);

  async function createRun() {
    setSubmitting(true);
    try {
      const caseIds = snapshot.cases
        .filter((testCase) => testCase.actionId === actionId)
        .map((testCase) => testCase.caseId);
      await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          actionId,
          caseIds: caseIds.length > 0 ? caseIds : defaultCaseIds,
          provider: "mock",
          model,
          temperature: 0,
        }),
      });
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  }

  if (snapshot.cases.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Run</CardTitle>
        <CardDescription>Run with the mock provider.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input
          aria-label="Run name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          aria-label="Action id"
          value={actionId}
          onChange={(event) => setActionId(event.target.value)}
        />
        <Input
          aria-label="Model"
          value={model}
          onChange={(event) => setModel(event.target.value)}
        />
        <Button type="button" onClick={createRun} disabled={submitting || !name || !actionId}>
          <Play data-icon="inline-start" />
          {submitting ? "Running" : "Start"}
        </Button>
      </CardContent>
    </Card>
  );
}

function WorkspaceSummary({ snapshot }: { snapshot: EvalWorkspaceResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription className="break-all">
          {snapshot.workspaceRoot ?? "No project selected"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-sm">
        <Metric label="Actions" value={new Set(snapshot.cases.map((item) => item.actionId)).size} />
        <Metric label="Cases" value={snapshot.cases.length} />
        <Metric label="Runs" value={snapshot.runs.length} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Diagnostics({ snapshot }: { snapshot: EvalWorkspaceResponse }) {
  if (snapshot.diagnostics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
          <CheckCircle2 data-icon="inline-start" />
          Workspace artifacts are valid.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle data-icon="inline-start" />
          Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {snapshot.diagnostics.map((diagnostic) => (
          <div key={`${diagnostic.path}-${diagnostic.message}`} className="rounded-md border p-3 text-sm">
            <div className="font-medium">{diagnostic.path}</div>
            <div className="text-muted-foreground">{diagnostic.message}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RunList({
  snapshot,
  selectedRunId,
  onSelectRun,
}: {
  snapshot: EvalWorkspaceResponse;
  selectedRunId: string;
  onSelectRun: (runId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runs</CardTitle>
        <CardDescription>Experiments grouped by Action.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {snapshot.runs.map((run) => {
          const results = snapshot.results.filter((result) => result.runId === run.runId);
          const average = averageScore(results, snapshot.annotations);
          return (
            <button
              key={run.runId}
              type="button"
              className="rounded-md border bg-background p-3 text-left transition-colors hover:bg-muted data-[selected=true]:border-primary"
              data-selected={run.runId === selectedRunId}
              onClick={() => onSelectRun(run.runId)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{run.name}</span>
                <LabelBadge variant="secondary">{run.producer}</LabelBadge>
              </div>
              <div className="mt-2 truncate text-xs text-muted-foreground">
                {run.actionId}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{run.runtime?.provider ?? "unknown"}/{run.runtime?.model ?? "unknown"}</span>
                <span>{results.length} results</span>
                <span>{average ?? "-"}/5</span>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RunDetail({
  run,
  results,
  cases,
  annotations,
  selectedResult,
  selectedCase,
  onSelectResult,
}: {
  run: EvalRun;
  results: EvalResult[];
  cases: EvalCase[];
  annotations: EvalAnnotation[];
  selectedResult?: EvalResult;
  selectedCase?: EvalCase;
  onSelectResult: (resultId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">{run.name}</CardTitle>
              <CardDescription className="mt-1 break-all">{run.runId}</CardDescription>
            </div>
            <div className="flex gap-2">
              <LabelBadge variant="secondary">{run.runtime?.provider ?? run.producer}</LabelBadge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResultsTable
            results={results}
            cases={cases}
            annotations={annotations}
            selectedResultId={selectedResult?.resultId ?? ""}
            onSelectResult={onSelectResult}
          />
        </CardContent>
      </Card>
      {selectedResult ? (
        <ResultReview
          result={selectedResult}
          testCase={selectedCase}
          annotation={annotations.find(
            (item) => item.resultId === selectedResult.resultId,
          )}
        />
      ) : null}
    </div>
  );
}

function ResultsTable({
  results,
  cases,
  annotations,
  selectedResultId,
  onSelectResult,
}: {
  results: EvalResult[];
  cases: EvalCase[];
  annotations: EvalAnnotation[];
  selectedResultId: string;
  onSelectResult: (resultId: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Case</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Tags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => {
          const testCase = cases.find((item) => item.caseId === result.caseId);
          const annotation = annotations.find((item) => item.resultId === result.resultId);
          return (
            <TableRow
              key={result.resultId}
              className="cursor-pointer data-[selected=true]:bg-muted"
              data-selected={result.resultId === selectedResultId}
              onClick={() => onSelectResult(result.resultId)}
            >
              <TableCell>
                <div className="font-medium">{testCase?.name ?? result.caseId}</div>
                <div className="text-xs text-muted-foreground">{result.caseId}</div>
              </TableCell>
              <TableCell>
                <LabelBadge variant={result.status === "failed" ? "destructive" : "secondary"}>
                  {result.status}
                </LabelBadge>
              </TableCell>
              <TableCell>{annotation?.score ?? "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(annotation?.tags ?? []).map((tag) => (
                    <LabelBadge key={tag} variant="outline">{tag}</LabelBadge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function ResultReview({
  result,
  testCase,
  annotation,
}: {
  result: EvalResult;
  testCase?: EvalCase;
  annotation?: EvalAnnotation;
}) {
  const [score, setScore] = React.useState(annotation?.score?.toString() ?? "");
  const [comment, setComment] = React.useState(annotation?.comment ?? "");
  const [tags, setTags] = React.useState((annotation?.tags ?? []).join(", "));
  const [saving, setSaving] = React.useState(false);

  async function saveAnnotation() {
    setSaving(true);
    try {
      await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: result.resultId,
          caseId: result.caseId,
          runId: result.runId,
          updatedAt: new Date().toISOString(),
          score: Number(score),
          comment: comment || undefined,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            <CardTitle className="text-lg">{testCase?.name ?? result.caseId}</CardTitle>
            <CardDescription>{result.runtime?.model ?? "unknown model"}</CardDescription>
          </div>
          <div className="grid gap-2 md:grid-cols-[96px_minmax(0,1fr)_auto]">
            <Input
              aria-label="Score"
              inputMode="numeric"
              min={0}
              max={5}
              placeholder="0-5"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
            <Input
              aria-label="Tags"
              placeholder="tag_one, tag_two"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
            <Button type="button" onClick={saveAnnotation} disabled={saving || score === ""}>
              <CircleDot data-icon="inline-start" />
              {saving ? "Saving" : "Save"}
            </Button>
          </div>
        </div>
        <Textarea
          aria-label="Annotation comment"
          placeholder="Comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="output">
          <TabsList>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="input">
            <JsonBlock value={testCase?.input ?? null} />
          </TabsContent>
          <TabsContent value="output">
            <JsonBlock value={result.parsedOutput ?? result.rawOutput} />
          </TabsContent>
          <TabsContent value="prompt">
            <JsonBlock value={result.renderedPrompt} />
          </TabsContent>
          <TabsContent value="variables">
            <JsonBlock
              value={{
                promptVariables: result.promptVariables ?? testCase?.promptVariables ?? null,
                promptTemplate: testCase?.promptTemplate ?? null,
              }}
            />
          </TabsContent>
          <TabsContent value="raw">
            <JsonBlock value={{ result, case: testCase ?? null, annotation: annotation ?? null }} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[560px] overflow-auto rounded-md bg-foreground p-4 text-xs leading-5 text-background">
      <code>
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </code>
    </pre>
  );
}

function averageScore(results: EvalResult[], annotations: EvalAnnotation[]) {
  const resultIds = new Set(results.map((result) => result.resultId));
  const scores = annotations
    .filter((annotation) => resultIds.has(annotation.resultId))
    .map((annotation) => annotation.score);
  if (scores.length === 0) return null;
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
}
