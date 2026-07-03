import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DeleteRunAnnotationsUseCase } from "./delete-run-annotations.use-case";
import { FilesystemEvalAnnotationRepository } from "../../infrastructure/filesystem-eval-annotation.repository";

describe("DeleteRunAnnotationsUseCase", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  function useCase() {
    return new DeleteRunAnnotationsUseCase(
      new FilesystemEvalAnnotationRepository(),
    );
  }

  it("removes the annotation directory of the run", async () => {
    const directory = path.join(workspaceRoot, "annotations", "run-1");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(
      path.join(directory, "case-1.annotation.json"),
      "{}",
      "utf8",
    );

    const deleted = await useCase().execute({ workspaceRoot, runId: "run-1" });

    expect(deleted.toPrimitives()).toBe("run-1");
    await expect(fs.stat(directory)).rejects.toThrow();
  });

  it("succeeds when the run has no annotations", async () => {
    const deleted = await useCase().execute({ workspaceRoot, runId: "run-2" });

    expect(deleted.toPrimitives()).toBe("run-2");
  });
});
