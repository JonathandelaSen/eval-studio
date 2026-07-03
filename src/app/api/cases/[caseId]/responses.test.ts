import { describe, expect, it } from "vitest";
import { toDeleteCaseResponse, toUpdateCaseResponse } from "./responses";

describe("toUpdateCaseResponse", () => {
  it("copies the case primitives", () => {
    const evalCase = {
      caseId: "550e8400-e29b-41d4-a716-446655440001",
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Summarize invoice",
      createdAt: "2026-07-01T00:00:00.000Z",
      renderedPrompt: { format: "text" },
    };

    const response = toUpdateCaseResponse(evalCase);

    expect(response).toEqual(evalCase);
    expect(response).not.toBe(evalCase);
  });
});

describe("toDeleteCaseResponse", () => {
  it("returns the deleted case id", () => {
    expect(toDeleteCaseResponse("case-1")).toEqual({ caseId: "case-1" });
  });
});
