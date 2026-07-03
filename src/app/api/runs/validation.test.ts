import { describe, expect, it } from "vitest";
import { parseCreateRunRequest } from "./validation";

describe("parseCreateRunRequest", () => {
  it("accepts a complete run request", () => {
    expect(
      parseCreateRunRequest({
        name: "Run 1",
        actionId: "action-1",
        caseIds: ["case-1"],
        provider: "mock",
        model: "mock-evaluator",
      }).ok,
    ).toBe(true);
  });

  it("rejects incomplete run requests", () => {
    expect(parseCreateRunRequest({})).toMatchObject({
      ok: false,
      error: { code: "invalid_request" },
    });
  });
});
