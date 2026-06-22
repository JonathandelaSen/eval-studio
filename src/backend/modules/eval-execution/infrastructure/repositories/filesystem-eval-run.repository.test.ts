import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

  it("saves the run artifact", async () => {
    const repo = new FilesystemEvalRunRepository(workspaceRoot);
    const actionUuid = "987f6543-e21b-32d1-b654-246614174111";
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const run = EvalRun.fromPrimitives({
      runId: "run-1",
      name: "Run 1",
      actionId: actionUuid,
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:00.000Z",
      caseIds: [caseUuid],
      runtime: null,
      notes: null,
      suiteId: null,
    });

    await repo.save(run);

    await expect(readFile(path.join(workspaceRoot, "runs/run-1/run.json"), "utf8")).resolves.toContain("Run 1");
  });
});
