import { describe, expect, it } from "vitest";
import { toCreateRunResponse } from "./responses";

describe("toCreateRunResponse", () => {
  it("maps run primitives without changing their shape", () => {
    const run = {
      runId: "run-1",
      name: "Run 1",
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      producer: "eval-studio",
      createdAt: "2026-07-03T00:00:00.000Z",
      caseIds: ["case-1"],
      runtime: null,
      notes: null,
      status: "queued" as const,
    };
    expect(toCreateRunResponse(run)).toEqual(run);
  });
});
