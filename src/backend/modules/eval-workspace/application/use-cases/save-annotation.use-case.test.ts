import { describe, expect, it } from "vitest";
import { SaveAnnotationUseCase } from "./save-annotation.use-case";
import { EvalAnnotation } from "../../domain/entities/eval-annotation.entity";
import type { EvalAnnotationRepository } from "../../domain/repositories/eval-annotation.repository";

describe("SaveAnnotationUseCase", () => {
  it("validates and saves an annotation", async () => {
    let saved: EvalAnnotation | undefined;
    const repo: EvalAnnotationRepository = {
      save: async (_workspaceRoot, annotation) => {
        saved = annotation;
        return annotation;
      },
      deleteByRun: async (_workspaceRoot, runId) => runId,
    };

    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = await new SaveAnnotationUseCase(repo).execute({
      resultId: "result-1",
      caseId: caseUuid,
      runId: "run-1",
      updatedAt: "2026-06-22T00:00:00.000Z",
      score: 4,
    });

    expect(result.score.toPrimitives()).toBe(4);
    expect(saved).toBeDefined();
    expect(saved?.toPrimitives().resultId).toBe("result-1");
  });

  it("rejects annotations without a valid score", async () => {
    const repo: EvalAnnotationRepository = {
      save: async (_workspaceRoot, annotation) => annotation,
      deleteByRun: async (_workspaceRoot, runId) => runId,
    };

    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    await expect(
      new SaveAnnotationUseCase(repo).execute({
        resultId: "result-1",
        caseId: caseUuid,
        runId: "run-1",
        updatedAt: "2026-06-22T00:00:00.000Z",
        score: 9,
      }),
    ).rejects.toThrow();
  });
});
