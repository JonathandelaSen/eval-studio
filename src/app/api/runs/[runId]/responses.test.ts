import { describe, expect, it } from "vitest";
import { toDeleteRunResponse, toUpdateRunResponse } from "./responses";

describe("toUpdateRunResponse", () => {
  it("copies the run primitives", () => {
    const run = {
      runId: "run-1",
      name: "Baseline",
      actionId: "550e8400-e29b-41d4-a716-446655440000",
      producer: "eval-studio",
      createdAt: "2026-07-01T00:00:00.000Z",
      caseIds: ["550e8400-e29b-41d4-a716-446655440001"],
      runtime: null,
      notes: null,
      suiteId: null,
    };

    const response = toUpdateRunResponse(run);

    expect(response).toEqual(run);
    expect(response.caseIds).not.toBe(run.caseIds);
  });
});

describe("toDeleteRunResponse", () => {
  it("returns the deleted run id", () => {
    expect(toDeleteRunResponse("run-1")).toEqual({ runId: "run-1" });
  });
});
