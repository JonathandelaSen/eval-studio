import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EvalResult } from "../../domain/entities/eval-result.entity";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import { FilesystemEvalRunRepository } from "./filesystem-eval-run.repository";

describe("FilesystemEvalRunRepository", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
  });

  afterEach(async () => {
    await rm(workspaceRoot, { recursive: true, force: true });
  });

  it("saves run and result artifacts", async () => {
    const repo = new FilesystemEvalRunRepository(workspaceRoot);
    const run = EvalRun.fromPrimitives({
      schemaVersion: "1",
      runId: "run-1",
      name: "Run 1",
      actionId: "action.score",
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:00.000Z",
      caseIds: ["case-1"],
    });
    const result = EvalResult.fromPrimitives({
      schemaVersion: "1",
      resultId: "result-1",
      caseId: "case-1",
      runId: "run-1",
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:01.000Z",
      renderedPrompt: { format: "messages", messages: [] },
      rawOutput: "{}",
      parsedOutput: {},
      status: "completed",
      error: null,
    });

    await repo.save(run);
    await repo.saveResult(result);

    await expect(readFile(path.join(workspaceRoot, "runs/run-1/run.json"), "utf8")).resolves.toContain("Run 1");
    await expect(readFile(path.join(workspaceRoot, "runs/run-1/results/case-1.result.json"), "utf8")).resolves.toContain("result-1");
  });
});
