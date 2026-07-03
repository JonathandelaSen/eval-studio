import { describe, expect, it } from "vitest";
import { EvalAnnotations } from "./eval-annotations.value-object";

describe("EvalAnnotations", () => {
  it("round-trips empty annotations array", () => {
    expect(EvalAnnotations.fromPrimitives([]).toPrimitives()).toEqual([]);
  });

  it("round-trips annotation values", () => {
    const annotations = [
      {
        resultId: "res1",
        caseId: "c1",
        runId: "r1",
        updatedAt: "2026-07-03T00:00:00Z",
        score: 4,
        comment: "Excellent",
        tags: ["accurate"],
      },
    ];
    expect(EvalAnnotations.fromPrimitives(annotations).toPrimitives()).toEqual(
      annotations,
    );
  });
});
