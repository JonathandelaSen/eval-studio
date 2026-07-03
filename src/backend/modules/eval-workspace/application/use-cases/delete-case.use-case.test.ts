import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DeleteCaseUseCase } from "./delete-case.use-case";
import { CaseNotFoundError } from "../../domain/errors/case-not-found.error";
import { FilesystemEvalCaseRepository } from "../../infrastructure/filesystem-eval-case.repository";

const caseId = "550e8400-e29b-41d4-a716-446655440001";

describe("DeleteCaseUseCase", () => {
  let workspaceRoot: string;
  let caseFile: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
    const directory = path.join(workspaceRoot, "suites", "invoices");
    await fs.mkdir(directory, { recursive: true });
    caseFile = path.join(directory, "summarize.case.json");
    await fs.writeFile(
      caseFile,
      JSON.stringify({
        caseId,
        suiteId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Summarize invoice",
        createdAt: "2026-07-01T00:00:00.000Z",
        renderedPrompt: { format: "text" },
      }),
      "utf8",
    );
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  function useCase() {
    return new DeleteCaseUseCase({
      caseRepository: new FilesystemEvalCaseRepository(),
    });
  }

  it("deletes the case file", async () => {
    const deleted = await useCase().execute({ workspaceRoot, caseId });

    expect(deleted.toPrimitives()).toBe(caseId);
    await expect(fs.stat(caseFile)).rejects.toThrow();
  });

  it("fails when the case does not exist", async () => {
    await expect(
      useCase().execute({
        workspaceRoot,
        caseId: "550e8400-e29b-41d4-a716-446655440099",
      }),
    ).rejects.toThrow(CaseNotFoundError);
  });

  it("fails when no project is selected", async () => {
    await expect(useCase().execute({ caseId })).rejects.toThrow(
      "No project is selected.",
    );
  });
});
