import { describe, expect, it } from "vitest";
import { EvalAnnotations } from "./eval-annotations.value-object";

describe("EvalAnnotations", () => {
  it("round-trips empty annotations array", () => {
    expect(EvalAnnotations.fromPrimitives([]).toPrimitives()).toEqual([]);
  });

  it("round-trips annotation values", () => {
    const annotations = [
      {
        annotationId: "ann1",
        runId: "r1",
        caseId: "c1",
        resultId: "res1",
        humanScore: 1,
        notes: "Excellent",
        createdAt: "2026-07-03T00:00:00Z",
      },
    ];
    expect(EvalAnnotations.fromPrimitives(annotations).toPrimitives()).toEqual(
      annotations,
    );
  });
});
