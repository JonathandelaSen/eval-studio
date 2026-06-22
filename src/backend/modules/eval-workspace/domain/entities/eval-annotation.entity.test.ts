import { describe, expect, it } from "vitest";
import { EvalAnnotation } from "./eval-annotation.entity";

describe("EvalAnnotation", () => {
  it("hydrates identities and score value object", () => {
    const annotation = EvalAnnotation.fromPrimitives({
      schemaVersion: "1",
      resultId: "result-1",
      caseId: "case-1",
      runId: "run-1",
      updatedAt: "2026-06-22T00:00:00.000Z",
      score: 4,
    });

    expect(annotation.score.toPrimitives()).toBe(4);
    expect(annotation.toPrimitives().resultId).toBe("result-1");
  });
});
