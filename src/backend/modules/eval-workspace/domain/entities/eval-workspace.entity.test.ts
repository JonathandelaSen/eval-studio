import { describe, expect, it } from "vitest";
import { EvalWorkspace } from "./eval-workspace.entity";

describe("EvalWorkspace", () => {
  it("round-trips workspace scan primitives", () => {
    const snapshot = EvalWorkspace.fromPrimitives({
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
