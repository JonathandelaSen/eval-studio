import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalResult } from "../../domain/entities/eval-result.entity";
import { FilesystemEvalResultRepository } from "./filesystem-eval-result.repository";

describe("FilesystemEvalResultRepository", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
  });

  afterEach(async () => {
    await rm(workspaceRoot, { recursive: true, force: true });
  });

  it("saves the result artifact", async () => {
    const repo = new FilesystemEvalResultRepository();
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = EvalResult.fromPrimitives({
      resultId: "result-1",
      caseId: caseUuid,
      runId: "run-1",
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:01.000Z",
      renderedPrompt: { format: "messages", messages: [] },
      rawOutput: "{}",
      parsedOutput: {},
      status: "completed",
      error: null,
    });

    await repo.save(WorkspaceRoot.fromPrimitives(workspaceRoot), result);

    await expect(
      readFile(path.join(workspaceRoot, `runs/run-1/results/${caseUuid}.result.json`), "utf8"),
    ).resolves.toContain("result-1");
  });
});
