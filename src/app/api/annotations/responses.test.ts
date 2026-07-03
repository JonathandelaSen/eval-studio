import { describe, expect, it } from "vitest";
import { toSaveAnnotationResponse } from "./responses";

describe("toSaveAnnotationResponse", () => {
  it("maps annotation primitives", () => {
    const annotation = {
      resultId: "result-1",
      caseId: "case-1",
      runId: "run-1",
      updatedAt: "2026-07-03T00:00:00.000Z",
      score: 4,
    };
    expect(toSaveAnnotationResponse(annotation)).toEqual(annotation);
  });
});
