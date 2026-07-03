import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";

export type EvalCaseItem = EvalWorkspaceResponse["cases"][number];
export type EvalRunItem = EvalWorkspaceResponse["runs"][number];
export type EvalResultItem = EvalWorkspaceResponse["results"][number];
export type EvalAnnotationItem = EvalWorkspaceResponse["annotations"][number];

export function formatJson(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function promptText(prompt: unknown): string {
  if (!prompt || typeof prompt !== "object") return formatJson(prompt);
  const record = prompt as Record<string, unknown>;
  if (typeof record.text === "string") return record.text;
  if (typeof record.content === "string") return record.content;
  const { format: _format, ...rest } = record;
  return Object.keys(rest).length > 0 ? formatJson(rest) : "";
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function actionIds(snapshot: EvalWorkspaceResponse): string[] {
  const ids = new Set<string>();
  for (const testCase of snapshot.cases) ids.add(testCase.actionId);
  for (const run of snapshot.runs) ids.add(run.actionId);
  return [...ids].sort();
}

export function runsForAction(
  snapshot: EvalWorkspaceResponse,
  actionId: string | null,
): EvalRunItem[] {
  const runs = actionId
    ? snapshot.runs.filter((run) => run.actionId === actionId)
    : [...snapshot.runs];
  return runs.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function casesForAction(
  snapshot: EvalWorkspaceResponse,
  actionId: string | null,
): EvalCaseItem[] {
  const cases = actionId
    ? snapshot.cases.filter((testCase) => testCase.actionId === actionId)
    : [...snapshot.cases];
  return cases.sort((left, right) => left.name.localeCompare(right.name));
}

export function resultsForRun(
  snapshot: EvalWorkspaceResponse,
  runId: string,
): EvalResultItem[] {
  return snapshot.results.filter((result) => result.runId === runId);
}

export function resultsForCase(
  snapshot: EvalWorkspaceResponse,
  caseId: string,
): EvalResultItem[] {
  return snapshot.results
    .filter((result) => result.caseId === caseId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function annotationFor(
  snapshot: EvalWorkspaceResponse,
  resultId: string,
): EvalAnnotationItem | undefined {
  return snapshot.annotations.find((item) => item.resultId === resultId);
}

export function averageScore(
  results: EvalResultItem[],
  annotations: EvalAnnotationItem[],
): number | null {
  const resultIds = new Set(results.map((result) => result.resultId));
  const scores = annotations
    .filter((annotation) => resultIds.has(annotation.resultId))
    .map((annotation) => annotation.score);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function statusCounts(results: EvalResultItem[]): {
  completed: number;
  failed: number;
} {
  let completed = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === "failed") failed += 1;
    else completed += 1;
  }
  return { completed, failed };
}

const TEXT_KEYS = [
  "text",
  "content",
  "context",
  "output",
  "completion",
  "answer",
  "message",
  "value",
];

export function readableText(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  for (const key of TEXT_KEYS) {
    if (typeof record[key] === "string") return record[key] as string;
  }
  const entries = Object.entries(record);
  if (entries.length === 1 && typeof entries[0][1] === "string") {
    return entries[0][1] as string;
  }
  return null;
}

export function recordEntries(
  value: unknown,
): Array<{ key: string; value: string }> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== null && entry !== undefined)
    .map(([key, entry]) => ({
      key,
      value: typeof entry === "string" ? entry : JSON.stringify(entry),
    }));
}

export function criteriaList(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const criteria = (value as Record<string, unknown>).criteria;
  if (!Array.isArray(criteria)) return [];
  return criteria.filter((entry): entry is string => typeof entry === "string");
}

export function reviewedCount(
  results: EvalResultItem[],
  annotations: EvalAnnotationItem[],
): number {
  const annotated = new Set(annotations.map((item) => item.resultId));
  return results.filter((result) => annotated.has(result.resultId)).length;
}

export function formatLatency(latencyMs: number | null | undefined): string {
  if (latencyMs === null || latencyMs === undefined) return "-";
  return `${latencyMs} ms`;
}

export function reviewedShare(snapshot: EvalWorkspaceResponse): number | null {
  if (snapshot.results.length === 0) return null;
  const annotated = new Set(snapshot.annotations.map((item) => item.resultId));
  const reviewed = snapshot.results.filter((result) =>
    annotated.has(result.resultId),
  ).length;
  return Math.round((reviewed / snapshot.results.length) * 100);
}
