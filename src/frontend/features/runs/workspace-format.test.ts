import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatLatency,
  parseJsonObjectField,
  promptText,
  runsForCase,
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
