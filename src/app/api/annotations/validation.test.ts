import { describe, expect, it } from "vitest";
import { parseSaveAnnotationRequest } from "./validation";

describe("parseSaveAnnotationRequest", () => {
  it("accepts a complete annotation", () => {
    expect(
      parseSaveAnnotationRequest({
        resultId: "result-1",
        caseId: "case-1",
        runId: "run-1",
        updatedAt: "2026-07-03T00:00:00.000Z",
        score: 4,
        tags: ["useful"],
      }).ok,
    ).toBe(true);
  });

  it("rejects scores outside zero to five", () => {
    expect(
      parseSaveAnnotationRequest({ score: 7 }),
    ).toMatchObject({ ok: false, error: { code: "invalid_request" } });
  });
});
