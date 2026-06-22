import { describe, expect, it } from "vitest";
import { SaveAnnotationUseCase } from "./save-annotation.use-case";
import { EvalAnnotation } from "../../domain/entities/eval-annotation.entity";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";
import { EvalWorkspaceSnapshot } from "../../domain/entities/eval-workspace-snapshot.entity";

describe("SaveAnnotationUseCase", () => {
  it("validates and saves an annotation", async () => {
    let saved: EvalAnnotation | undefined;
    const repo: EvalWorkspaceRepository = {
      scan: async () => EvalWorkspaceSnapshot.fromPrimitives({
        workspaceRoot: null,
        manifest: null,
        suites: [],
        cases: [],
        runs: [],
        results: [],
        annotations: [],
        diagnostics: [],
      }),
      saveAnnotation: async (annotation) => {
        saved = annotation;
        return annotation;
      },
    };

    const result = await new SaveAnnotationUseCase(repo).execute({
      schemaVersion: "1",
      resultId: "result-1",
      caseId: "case-1",
      runId: "run-1",
      updatedAt: "2026-06-22T00:00:00.000Z",
      score: 4,
    });

    expect(result.score.toPrimitives()).toBe(4);
    expect(saved).toBeDefined();
    expect(saved?.toPrimitives().resultId).toBe("result-1");
  });

  it("rejects annotations without a valid score", async () => {
    const repo: EvalWorkspaceRepository = {
      scan: async () => EvalWorkspaceSnapshot.fromPrimitives({
        workspaceRoot: null,
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

    await expect(
      new SaveAnnotationUseCase(repo).execute({
        schemaVersion: "1",
        resultId: "result-1",
        caseId: "case-1",
        runId: "run-1",
        updatedAt: "2026-06-22T00:00:00.000Z",
        score: 9,
      }),
    ).rejects.toThrow();
  });
});
