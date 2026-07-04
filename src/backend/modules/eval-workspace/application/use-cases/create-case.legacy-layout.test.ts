import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FilesystemEvalCaseRepository } from "../../infrastructure/filesystem-eval-case.repository";
import { FilesystemEvalSuiteRepository } from "../../infrastructure/filesystem-eval-suite.repository";
import { CreateCaseUseCase } from "./create-case.use-case";

describe("CreateCaseUseCase legacy suite layout", () => {
  let workspaceRoot: string | undefined;

  afterEach(async () => {
    if (workspaceRoot) await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("creates a case when the suite directory is not named after its ID", async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "eval-studio-create-case-"));
    const suiteDirectory = path.join(workspaceRoot, "suites", "legacy-suite-slug");
    await fs.mkdir(path.join(suiteDirectory, "cases"), { recursive: true });
    await fs.writeFile(
      path.join(suiteDirectory, "suite.json"),
      JSON.stringify({
        schemaVersion: "1",
        suiteId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Legacy suite",
        caseIds: [],
      }),
    );

    const useCase = new CreateCaseUseCase({
      caseRepository: new FilesystemEvalCaseRepository(),
      suiteRepository: new FilesystemEvalSuiteRepository(),
      idFactory: () => "987f6543-e21b-42d1-b654-246614174111",
      now: () => "2026-07-04T10:00:00.000Z",
    });

    await useCase.execute({
      workspaceRoot,
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "New case",
      userMessage: "Hello",
    });

    const suite = JSON.parse(
      await fs.readFile(path.join(suiteDirectory, "suite.json"), "utf8"),
    ) as { caseIds: string[] };
    expect(suite.caseIds).toEqual(["987f6543-e21b-42d1-b654-246614174111"]);
    await expect(
      fs.stat(
        path.join(
          suiteDirectory,
          "cases",
          "987f6543-e21b-42d1-b654-246614174111.case.json",
        ),
      ),
    ).resolves.toBeDefined();
    await expect(
      fs.stat(
        path.join(
          workspaceRoot,
          "suites",
          "550e8400-e29b-41d4-a716-446655440000",
        ),
      ),
    ).rejects.toThrow();
  });
});
