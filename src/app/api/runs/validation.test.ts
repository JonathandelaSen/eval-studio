import { describe, expect, it } from "vitest";
import { parseCreateRunRequest } from "./validation";

describe("parseCreateRunRequest", () => {
  it("accepts a complete run request", () => {
    expect(
      parseCreateRunRequest({
        name: "Run 1",
        suiteId: "550e8400-e29b-41d4-a716-446655440000",
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

  it("accepts an existing slug-style suite id", () => {
    expect(
      parseCreateRunRequest({
        name: "Run 1",
        suiteId: "glideboard.phrase-completion",
        caseIds: ["case-1"],
        provider: "ollama",
        model: "gemma3:1b",
      }).ok,
    ).toBe(true);
  });
});
