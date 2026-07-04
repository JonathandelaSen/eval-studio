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

export function parseJsonObjectField(
  value: string,
): Record<string, unknown> | undefined {
  if (!value.trim()) return undefined;
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Enter a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function promptText(prompt: unknown): string {
  if (!prompt || typeof prompt !== "object") return formatJson(prompt);
  const record = prompt as Record<string, unknown>;
  if (typeof record.text === "string") return record.text;
  if (typeof record.content === "string") return record.content;
  if (Array.isArray(record.messages)) {
    const messages = record.messages.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const message = entry as Record<string, unknown>;
      if (
        typeof message.role !== "string" ||
        typeof message.content !== "string"
      ) {
        return [];
      }
      return [{ role: message.role, content: message.content }];
    });
    if (messages.length === record.messages.length) {
      if (messages.length === 1 && messages[0].role === "user") {
        return messages[0].content;
      }
      return messages
        .map((message) => `[${message.role}]\n${message.content}`)
        .join("\n\n");
    }
  }
  const { format: _format, ...rest } = record;
  return Object.keys(rest).length > 0 ? formatJson(rest) : "";
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })} UTC`;
}

export function runsForSuite(
  snapshot: EvalWorkspaceResponse,
  suiteId: string | null,
): EvalRunItem[] {
  const runs = suiteId
    ? snapshot.runs.filter((run) => run.suiteId === suiteId)
    : [...snapshot.runs];
  return runs.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function runsForCase(
  runs: EvalRunItem[],
  caseId: string | null,
): EvalRunItem[] {
  if (!caseId) return [];
  return runs.filter((run) => run.caseIds.includes(caseId));
}

export function casesForSuite(
  snapshot: EvalWorkspaceResponse,
  suiteId: string | null,
): EvalCaseItem[] {
  const cases = suiteId
    ? snapshot.cases.filter((testCase) => testCase.suiteId === suiteId)
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
  if (latencyMs >= 1_000) {
    const seconds = Math.round((latencyMs / 1_000) * 10) / 10;
    return `${seconds} s`;
  }
  return `${latencyMs} ms`;
}

export function totalLatency(
  results: ReadonlyArray<{ latencyMs?: number | null }>,
): number | null {
  const recorded = results.flatMap((result) =>
    result.latencyMs === null || result.latencyMs === undefined
      ? []
      : [result.latencyMs],
  );
  if (recorded.length === 0) return null;
  return recorded.reduce((total, latencyMs) => total + latencyMs, 0);
}

export function reviewedShare(snapshot: EvalWorkspaceResponse): number | null {
  if (snapshot.results.length === 0) return null;
  const annotated = new Set(snapshot.annotations.map((item) => item.resultId));
  const reviewed = snapshot.results.filter((result) =>
    annotated.has(result.resultId),
  ).length;
  return Math.round((reviewed / snapshot.results.length) * 100);
}

export const PASS_SCORE_THRESHOLD = 4;

type RuntimeLike = {
  provider?: string | null;
  model?: string | null;
  temperature?: number | null;
} | null;

export type RuntimeIdentity = {
  key: string;
  provider: string;
  model: string;
  temperature: number | null;
};

export function runtimeIdentity(runtime: RuntimeLike): RuntimeIdentity {
  const provider = runtime?.provider ?? "?";
  const model = runtime?.model ?? "?";
  const temperature = runtime?.temperature ?? null;
  return { key: `${provider}|${model}|${temperature}`, provider, model, temperature };
}

export function resultsForSuite(
  snapshot: EvalWorkspaceResponse,
  suiteId: string | null,
): EvalResultItem[] {
  const runIds = new Set(runsForSuite(snapshot, suiteId).map((run) => run.runId));
  return snapshot.results.filter((result) => runIds.has(result.runId));
}

function resolveRuntime(
  snapshot: EvalWorkspaceResponse,
  result: EvalResultItem,
): RuntimeLike {
  const run = snapshot.runs.find((item) => item.runId === result.runId);
  return result.runtime ?? run?.runtime ?? null;
}

function meanLatency(results: EvalResultItem[]): number | null {
  const recorded = results.flatMap((result) =>
    result.latencyMs === null || result.latencyMs === undefined
      ? []
      : [result.latencyMs],
  );
  if (recorded.length === 0) return null;
  return recorded.reduce((total, value) => total + value, 0) / recorded.length;
}

export type RuntimeLeaderboardRow = {
  identity: RuntimeIdentity;
  runtime: RuntimeLike;
  meanScore: number | null;
  passRate: number | null;
  annotatedCount: number;
  meanLatency: number | null;
  resultCount: number;
  failedCount: number;
  coveredCases: number;
};

export function buildRuntimeLeaderboard(
  snapshot: EvalWorkspaceResponse,
  suiteId: string | null,
): RuntimeLeaderboardRow[] {
  const results = resultsForSuite(snapshot, suiteId);
  const scoreByResult = new Map(
    snapshot.annotations.map((item) => [item.resultId, item.score]),
  );
  const groups = new Map<
    string,
    { identity: RuntimeIdentity; runtime: RuntimeLike; results: EvalResultItem[] }
  >();

  for (const result of results) {
    const runtime = resolveRuntime(snapshot, result);
    const identity = runtimeIdentity(runtime);
    const group = groups.get(identity.key);
    if (group) {
      group.results.push(result);
    } else {
      groups.set(identity.key, { identity, runtime, results: [result] });
    }
  }

  const rows = [...groups.values()].map(({ identity, runtime, results: group }) => {
    const scores = group
      .map((result) => scoreByResult.get(result.resultId))
      .filter((score): score is number => typeof score === "number");
    const meanScore =
      scores.length === 0
        ? null
        : scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const passRate =
      scores.length === 0
        ? null
        : scores.filter((score) => score >= PASS_SCORE_THRESHOLD).length /
          scores.length;
    const failedCount = group.filter(
      (result) => result.status === "failed",
    ).length;
    const coveredCases = new Set(group.map((result) => result.caseId)).size;
    return {
      identity,
      runtime,
      meanScore,
      passRate,
      annotatedCount: scores.length,
      meanLatency: meanLatency(group),
      resultCount: group.length,
      failedCount,
      coveredCases,
    };
  });

  return rows.sort((left, right) => {
    const leftScore = left.meanScore ?? -1;
    const rightScore = right.meanScore ?? -1;
    if (rightScore !== leftScore) return rightScore - leftScore;
    const leftLatency = left.meanLatency ?? Number.POSITIVE_INFINITY;
    const rightLatency = right.meanLatency ?? Number.POSITIVE_INFINITY;
    if (leftLatency !== rightLatency) return leftLatency - rightLatency;
    return left.identity.key.localeCompare(right.identity.key);
  });
}

export type MatrixCell = {
  result: EvalResultItem;
  score: number | null;
  count: number;
} | null;

export type SuiteMatrix = {
  cases: EvalCaseItem[];
  columns: Array<{ identity: RuntimeIdentity; runtime: RuntimeLike }>;
  cellFor: (caseId: string, runtimeKey: string) => MatrixCell;
  bestScoreFor: (caseId: string) => number | null;
};

export function buildSuiteMatrix(
  snapshot: EvalWorkspaceResponse,
  suiteId: string | null,
): SuiteMatrix {
  const cases = casesForSuite(snapshot, suiteId);
  const results = resultsForSuite(snapshot, suiteId);
  const scoreByResult = new Map(
    snapshot.annotations.map((item) => [item.resultId, item.score]),
  );
  const columns: Array<{ identity: RuntimeIdentity; runtime: RuntimeLike }> = [];
  const columnKeys = new Set<string>();
  const cells = new Map<string, MatrixCell>();

  for (const result of results) {
    const runtime = resolveRuntime(snapshot, result);
    const identity = runtimeIdentity(runtime);
    if (!columnKeys.has(identity.key)) {
      columnKeys.add(identity.key);
      columns.push({ identity, runtime });
    }
    const cellKey = `${result.caseId}::${identity.key}`;
    const existing = cells.get(cellKey);
    const isNewer =
      !existing ||
      result.createdAt.localeCompare(existing.result.createdAt) > 0;
    const chosen = isNewer ? result : existing.result;
    cells.set(cellKey, {
      result: chosen,
      score: scoreByResult.get(chosen.resultId) ?? null,
      count: (existing?.count ?? 0) + 1,
    });
  }

  columns.sort((left, right) =>
    left.identity.key.localeCompare(right.identity.key),
  );

  return {
    cases,
    columns,
    cellFor: (caseId, runtimeKey) => cells.get(`${caseId}::${runtimeKey}`) ?? null,
    bestScoreFor: (caseId) => {
      let best: number | null = null;
      for (const column of columns) {
        const cell = cells.get(`${caseId}::${column.identity.key}`);
        if (cell?.score !== null && cell?.score !== undefined) {
          best = best === null ? cell.score : Math.max(best, cell.score);
        }
      }
      return best;
    },
  };
}
