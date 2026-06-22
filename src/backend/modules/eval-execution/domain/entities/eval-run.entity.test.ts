import { describe, expect, it } from "vitest";
import { EvalRun } from "./eval-run.entity";

describe("EvalRun", () => {
  it("hydrates identities and round-trips primitives", () => {
    const run = EvalRun.fromPrimitives({
      schemaVersion: "1",
      runId: "run-1",
      name: "Run 1",
      actionId: "action.score",
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:00.000Z",
      caseIds: ["case-1"],
    });

    expect(run.id.toPrimitives()).toBe("run-1");
    expect(run.actionId.toPrimitives()).toBe("action.score");
    expect(run.toPrimitives().caseIds).toEqual(["case-1"]);
  });
});
