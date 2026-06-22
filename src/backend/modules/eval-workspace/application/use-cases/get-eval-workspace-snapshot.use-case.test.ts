import { describe, expect, it } from "vitest";
import { GetEvalWorkspaceSnapshotUseCase } from "./get-eval-workspace-snapshot.use-case";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";
import { EvalWorkspaceSnapshot } from "../../domain/entities/eval-workspace-snapshot.entity";

describe("GetEvalWorkspaceSnapshotUseCase", () => {
  it("returns the repository snapshot", async () => {
    const repo: EvalWorkspaceRepository = {
      scan: async () => EvalWorkspaceSnapshot.fromPrimitives({
        workspaceRoot: "/tmp/evals",
        manifest: null,
        suites: [],
        cases: [],
        runs: [],
        results: [],
        annotations: [],
        diagnostics: [],
      }),
      saveAnnotation: async (annotation) => annotation,
    };

    const result = await new GetEvalWorkspaceSnapshotUseCase(repo).execute();

    expect(result.toPrimitives().workspaceRoot).toBe("/tmp/evals");
  });
});
