import { describe, expect, it } from "vitest";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import {
  buildRuntimeLeaderboard,
  buildSuiteMatrix,
  formatDate,
  formatLatency,
  parseJsonObjectField,
  promptText,
  runsForCase,
  runtimeIdentity,
  totalLatency,
  type EvalRunItem,
} from "./workspace-format";

describe("promptText", () => {
  it("shows a single user message exactly as it was sent", () => {
    expect(
      promptText({
        format: "messages",
        messages: [{ role: "user", content: "Complete this sentence: " }],
      }),
    ).toBe("Complete this sentence: ");
  });

  it("preserves message order, roles, and content for a conversation", () => {
    expect(
      promptText({
        format: "messages",
        messages: [
          { role: "system", content: "Continue the text." },
          { role: "user", content: "Hello\nworld" },
          { role: "assistant", content: "Hi" },
        ],
      }),
    ).toBe(
      "[system]\nContinue the text.\n\n[user]\nHello\nworld\n\n[assistant]\nHi",
    );
  });
});

describe("parseJsonObjectField", () => {
  it("parses an optional JSON object", () => {
    expect(parseJsonObjectField("  ")).toBeUndefined();
    expect(parseJsonObjectField('{"invoiceId":"inv-1"}')).toEqual({
      invoiceId: "inv-1",
    });
  });

  it("rejects invalid JSON and non-object values", () => {
    expect(() => parseJsonObjectField("{" )).toThrow();
    expect(() => parseJsonObjectField("[1, 2]")).toThrow(
      "Enter a JSON object.",
    );
    expect(() => parseJsonObjectField("null")).toThrow(
      "Enter a JSON object.",
    );
  });
});

describe("formatDate", () => {
  it("formats artifact timestamps deterministically in UTC", () => {
    expect(formatDate("2026-07-03T12:23:00.000Z")).toBe("03 Jul 2026, 12:23 UTC");
  });
});

describe("totalLatency", () => {
  it("adds the recorded latency for every result in a run", () => {
    expect(
      totalLatency([
        { latencyMs: 120 },
        { latencyMs: null },
        { latencyMs: 380 },
      ]),
    ).toBe(500);
  });

  it("returns null when the run has no recorded latency", () => {
    expect(totalLatency([{ latencyMs: null }, {}])).toBeNull();
  });
});

describe("formatLatency", () => {
  it("keeps durations below one second in milliseconds", () => {
    expect(formatLatency(999)).toBe("999 ms");
  });

  it("switches to seconds from one second", () => {
    expect(formatLatency(1_000)).toBe("1 s");
    expect(formatLatency(1_500)).toBe("1.5 s");
    expect(formatLatency(60_875)).toBe("60.9 s");
  });
});

describe("runsForCase", () => {
  const runs: EvalRunItem[] = [
    {
      runId: "run-both",
      name: "Both cases",
      suiteId: "suite-1",
      producer: "eval-studio",
      createdAt: "2026-07-04T12:00:00.000Z",
      caseIds: ["case-1", "case-2"],
      runtime: null,
      notes: null,
      status: "completed",
    },
    {
      runId: "run-second",
      name: "Second case only",
      suiteId: "suite-1",
      producer: "eval-studio",
      createdAt: "2026-07-04T11:00:00.000Z",
      caseIds: ["case-2"],
      runtime: null,
      notes: null,
      status: "completed",
    },
  ];

  it("returns only runs that include the selected case", () => {
    expect(runsForCase(runs, "case-1").map((run) => run.runId)).toEqual([
      "run-both",
    ]);
    expect(runsForCase(runs, "case-2").map((run) => run.runId)).toEqual([
      "run-both",
      "run-second",
    ]);
  });

  it("returns no runs until a case is selected", () => {
    expect(runsForCase(runs, null)).toEqual([]);
  });
});

type Runtime = { provider: string; model: string; temperature: number | null };

function makeSnapshot(input: {
  runs: Array<{ runId: string; runtime: Runtime; createdAt?: string }>;
  cases: Array<{ caseId: string; name: string }>;
  results: Array<{
    resultId: string;
    caseId: string;
    runId: string;
    createdAt: string;
    latencyMs?: number | null;
    status?: "completed" | "failed";
    runtime?: Runtime | null;
  }>;
  annotations: Array<{ resultId: string; score: number }>;
}): EvalWorkspaceResponse {
  return {
    workspaceRoot: null,
    manifest: null,
    suites: [{ suiteId: "suite-1", name: "Suite" }],
    cases: input.cases.map((testCase) => ({
      ...testCase,
      suiteId: "suite-1",
    })),
    runs: input.runs.map((run) => ({
      runId: run.runId,
      name: run.runId,
      suiteId: "suite-1",
      producer: "eval-studio",
      createdAt: run.createdAt ?? "2026-07-04T00:00:00.000Z",
      caseIds: [],
      runtime: run.runtime,
      notes: null,
      status: "completed",
    })),
    results: input.results.map((result) => ({
      resultId: result.resultId,
      caseId: result.caseId,
      runId: result.runId,
      producer: "eval-studio",
      createdAt: result.createdAt,
      runtime: result.runtime === undefined ? null : result.runtime,
      renderedPrompt: { format: "text" },
      rawOutput: null,
      parsedOutput: null,
      status: result.status ?? "completed",
      error: null,
      latencyMs: result.latencyMs ?? null,
    })),
    annotations: input.annotations.map((annotation) => ({
      resultId: annotation.resultId,
      caseId: "case-1",
      runId: "run-1",
      updatedAt: "2026-07-04T00:00:00.000Z",
      score: annotation.score,
    })),
    diagnostics: [],
  } as unknown as EvalWorkspaceResponse;
}

describe("runtimeIdentity", () => {
  it("keys a runtime by provider, model and temperature", () => {
    expect(
      runtimeIdentity({ provider: "ollama", model: "gemma3:1b", temperature: 0 })
        .key,
    ).toBe("ollama|gemma3:1b|0");
  });

  it("separates the same model at different temperatures", () => {
    const hot = runtimeIdentity({ provider: "p", model: "m", temperature: 2 });
    const cold = runtimeIdentity({ provider: "p", model: "m", temperature: 0 });
    expect(hot.key).not.toBe(cold.key);
  });
});

describe("buildRuntimeLeaderboard", () => {
  const cold: Runtime = { provider: "p", model: "m", temperature: 0 };
  const hot: Runtime = { provider: "p", model: "m", temperature: 2 };
  const snapshot = makeSnapshot({
    runs: [
      { runId: "run-cold", runtime: cold },
      { runId: "run-hot", runtime: hot },
    ],
    cases: [
      { caseId: "case-1", name: "A" },
      { caseId: "case-2", name: "B" },
    ],
    results: [
      { resultId: "r1", caseId: "case-1", runId: "run-cold", createdAt: "1", latencyMs: 100 },
      { resultId: "r2", caseId: "case-2", runId: "run-cold", createdAt: "2", latencyMs: 300 },
      { resultId: "r3", caseId: "case-1", runId: "run-hot", createdAt: "3", latencyMs: 200 },
    ],
    annotations: [
      { resultId: "r1", score: 5 },
      { resultId: "r2", score: 0 },
      { resultId: "r3", score: 3 },
    ],
  });

  it("groups by runtime identity and ranks by mean score", () => {
    const rows = buildRuntimeLeaderboard(snapshot, "suite-1");
    expect(rows.map((row) => row.identity.key)).toEqual([
      "p|m|2",
      "p|m|0",
    ]);
  });

  it("averages score and latency within a runtime group", () => {
    const [, coldRow] = buildRuntimeLeaderboard(snapshot, "suite-1");
    expect(coldRow.meanScore).toBe(2.5);
    expect(coldRow.meanLatency).toBe(200);
    expect(coldRow.resultCount).toBe(2);
    expect(coldRow.coveredCases).toBe(2);
  });

  it("computes pass rate as the share of scores at or above 4", () => {
    const rows = buildRuntimeLeaderboard(snapshot, "suite-1");
    const coldRow = rows.find((row) => row.identity.key === "p|m|0");
    expect(coldRow?.passRate).toBe(0.5);
  });

  it("counts failed results apart from the score", () => {
    const withFailure = makeSnapshot({
      runs: [{ runId: "run-cold", runtime: cold }],
      cases: [{ caseId: "case-1", name: "A" }],
      results: [
        { resultId: "r1", caseId: "case-1", runId: "run-cold", createdAt: "1", status: "failed" },
      ],
      annotations: [],
    });
    const [row] = buildRuntimeLeaderboard(withFailure, "suite-1");
    expect(row.meanScore).toBeNull();
    expect(row.failedCount).toBe(1);
  });
});

describe("buildSuiteMatrix", () => {
  const cold: Runtime = { provider: "p", model: "m", temperature: 0 };
  const snapshot = makeSnapshot({
    runs: [
      { runId: "run-old", runtime: cold },
      { runId: "run-new", runtime: cold },
    ],
    cases: [{ caseId: "case-1", name: "A" }],
    results: [
      { resultId: "old", caseId: "case-1", runId: "run-old", createdAt: "2026-01-01T00:00:00.000Z", latencyMs: 100 },
      { resultId: "new", caseId: "case-1", runId: "run-new", createdAt: "2026-02-01T00:00:00.000Z", latencyMs: 200 },
    ],
    annotations: [
      { resultId: "old", score: 0 },
      { resultId: "new", score: 5 },
    ],
  });

  it("keeps the most recent result per cell and counts the rest", () => {
    const matrix = buildSuiteMatrix(snapshot, "suite-1");
    const cell = matrix.cellFor("case-1", "p|m|0");
    expect(cell?.result.resultId).toBe("new");
    expect(cell?.score).toBe(5);
    expect(cell?.count).toBe(2);
  });

  it("reports the best score in a row", () => {
    const matrix = buildSuiteMatrix(snapshot, "suite-1");
    expect(matrix.bestScoreFor("case-1")).toBe(5);
  });

  it("returns no cell when a runtime never ran a case", () => {
    const matrix = buildSuiteMatrix(snapshot, "suite-1");
    expect(matrix.cellFor("case-1", "other|model|0")).toBeNull();
  });
});
