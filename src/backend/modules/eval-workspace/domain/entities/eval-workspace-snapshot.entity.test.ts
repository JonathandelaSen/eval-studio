import { describe, expect, it } from "vitest";
import { EvalWorkspaceSnapshot } from "./eval-workspace-snapshot.entity";

describe("EvalWorkspaceSnapshot", () => {
  it("round-trips workspace scan primitives", () => {
    const snapshot = EvalWorkspaceSnapshot.fromPrimitives({
      workspaceRoot: "/tmp/evals",
      manifest: null,
      suites: [],
      cases: [],
      runs: [],
      results: [],
      annotations: [],
      diagnostics: [],
    });

    expect(snapshot.toPrimitives().workspaceRoot).toBe("/tmp/evals");
  });
});
