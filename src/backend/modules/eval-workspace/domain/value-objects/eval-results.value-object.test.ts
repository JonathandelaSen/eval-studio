import { describe, expect, it } from "vitest";
import { EvalResults } from "./eval-results.value-object";

describe("EvalResults", () => {
  it("round-trips empty results array", () => {
    expect(EvalResults.fromPrimitives([]).toPrimitives()).toEqual([]);
  });

  it("round-trips result values", () => {
    const results = [
      {
        resultId: "res1",
        runId: "r1",
        caseId: "c1",
        createdAt: "2026-07-03T00:00:00Z",
        status: {
          kind: "success" as const,
        },
        latencyMs: 120,
        usage: null,
        rawOutput: "Success",
        parsedOutput: null,
        error: null,
      },
    ];
    expect(EvalResults.fromPrimitives(results).toPrimitives()).toEqual(results);
  });
});
