import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DeleteRunUseCase } from "./delete-run.use-case";
import { RunNotFoundError } from "../../domain/errors/run-not-found.error";
import { FilesystemEvalRunRepository } from "../../infrastructure/repositories/filesystem-eval-run.repository";

describe("DeleteRunUseCase", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("deletes the run directory with its results", async () => {
    const runDirectory = path.join(workspaceRoot, "runs", "run-1");
    await fs.mkdir(path.join(runDirectory, "results"), { recursive: true });
    await fs.writeFile(path.join(runDirectory, "run.json"), "{}", "utf8");
    await fs.writeFile(
      path.join(runDirectory, "results", "case-1.result.json"),
      "{}",
      "utf8",
    );

    const useCase = new DeleteRunUseCase({
      runRepository: new FilesystemEvalRunRepository(),
    });
    const deleted = await useCase.execute({ workspaceRoot, runId: "run-1" });

    expect(deleted.toPrimitives()).toBe("run-1");
    await expect(fs.stat(runDirectory)).rejects.toThrow();
  });

  it("fails when the run does not exist", async () => {
    const useCase = new DeleteRunUseCase({
      runRepository: new FilesystemEvalRunRepository(),
    });

    await expect(
      useCase.execute({ workspaceRoot, runId: "missing" }),
    ).rejects.toThrow(RunNotFoundError);
  });

  it("fails when no project is selected", async () => {
    const useCase = new DeleteRunUseCase({
      runRepository: new FilesystemEvalRunRepository(),
    });

    await expect(useCase.execute({ runId: "run-1" })).rejects.toThrow(
      "No project is selected.",
    );
  });
});
