import { describe, expect, it } from "vitest";
import { EvalWorkspace } from "./eval-workspace.entity";
import { WorkspaceRootNullable } from "../value-objects/workspace-root-nullable.value-object";
import { EvalManifestNullable } from "../value-objects/eval-manifest-nullable.value-object";
import { EvalSuites } from "../value-objects/eval-suites.value-object";
import { EvalCases } from "../value-objects/eval-cases.value-object";
import { EvalRuns } from "../value-objects/eval-runs.value-object";
import { EvalResults } from "../value-objects/eval-results.value-object";
import { EvalAnnotations } from "../value-objects/eval-annotations.value-object";
import { WorkspaceDiagnostics } from "../value-objects/workspace-diagnostics.value-object";

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

  it("can be created via create factory method", () => {
    const workspace = EvalWorkspace.create({
      id: WorkspaceRootNullable.fromPrimitives("/tmp/evals"),
      manifest: EvalManifestNullable.fromPrimitives(null),
      suites: EvalSuites.fromPrimitives([]),
      cases: EvalCases.fromPrimitives([]),
      runs: EvalRuns.fromPrimitives([]),
      results: EvalResults.fromPrimitives([]),
      annotations: EvalAnnotations.fromPrimitives([]),
      diagnostics: WorkspaceDiagnostics.fromPrimitives([]),
    });

    expect(workspace.id.toPrimitives()).toBe("/tmp/evals");
    expect(workspace.toPrimitives().workspaceRoot).toBe("/tmp/evals");
  });
});
