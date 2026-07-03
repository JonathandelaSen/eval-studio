import { describe, expect, it } from "vitest";
import { EvalRuns } from "./eval-runs.value-object";

describe("EvalRuns", () => {
  it("round-trips empty runs array", () => {
    expect(EvalRuns.fromPrimitives([]).toPrimitives()).toEqual([]);
  });

  it("round-trips run values", () => {
    const runs = [
      {
        runId: "r1",
        name: "Run 1",
        suiteId: "s1",
        producer: "user",
        createdAt: "2026-07-03T00:00:00Z",
        caseIds: ["c1"],
        runtime: null,
        notes: null,
        status: "completed" as const,
      },
    ];
    expect(EvalRuns.fromPrimitives(runs).toPrimitives()).toEqual(runs);
  });
});
