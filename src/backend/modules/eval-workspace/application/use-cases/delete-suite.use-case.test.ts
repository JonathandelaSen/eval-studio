import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FilesystemEvalSuiteRepository } from "../../infrastructure/filesystem-eval-suite.repository";
import { DeleteSuiteUseCase } from "./delete-suite.use-case";

const suiteId = "550e8400-e29b-41d4-a716-446655440000";

describe("DeleteSuiteUseCase", () => {
  let workspaceRoot: string;
  let suiteDirectory: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
    suiteDirectory = path.join(workspaceRoot, "suites", "support");
    await fs.mkdir(path.join(suiteDirectory, "cases"), { recursive: true });
    await fs.writeFile(
      path.join(suiteDirectory, "suite.json"),
      JSON.stringify({
        suiteId,
        name: "Support",
        description: null,
        caseIds: ["550e8400-e29b-41d4-a716-446655440001"],
        schemaVersion: 1,
      }),
      "utf8",
    );
    await fs.writeFile(
      path.join(suiteDirectory, "cases", "refund.case.json"),
      "{}",
      "utf8",
    );
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("deletes the suite directory and its cases", async () => {
    const useCase = new DeleteSuiteUseCase({
      suiteRepository: new FilesystemEvalSuiteRepository(),
    });

    const deleted = await useCase.execute({ workspaceRoot, suiteId });

    expect(deleted.toPrimitives()).toBe(suiteId);
    await expect(fs.stat(suiteDirectory)).rejects.toThrow();
  });

  it("fails when no project is selected", async () => {
    const useCase = new DeleteSuiteUseCase({
      suiteRepository: new FilesystemEvalSuiteRepository(),
    });

    await expect(useCase.execute({ suiteId })).rejects.toThrow(
      "No project is selected.",
    );
  });

  it("does not delete outside the suites directory", async () => {
    const useCase = new DeleteSuiteUseCase({
      suiteRepository: new FilesystemEvalSuiteRepository(),
    });

    await expect(
      useCase.execute({ workspaceRoot, suiteId: ".." }),
    ).rejects.toThrow("Path escapes the suites directory.");
    await expect(fs.stat(workspaceRoot)).resolves.toBeDefined();
  });
});
