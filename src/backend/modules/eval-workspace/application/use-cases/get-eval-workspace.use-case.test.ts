import { describe, expect, it } from "vitest";
import { GetEvalWorkspaceUseCase } from "./get-eval-workspace.use-case";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";
import { EvalWorkspace } from "../../domain/entities/eval-workspace.entity";

describe("GetEvalWorkspaceUseCase", () => {
  it("returns the repository snapshot", async () => {
    const repo: EvalWorkspaceRepository = {
      scan: async () => EvalWorkspace.fromPrimitives({
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

    const result = await new GetEvalWorkspaceUseCase(repo).execute();

    expect(result.toPrimitives().workspaceRoot).toBe("/tmp/evals");
  });
});
