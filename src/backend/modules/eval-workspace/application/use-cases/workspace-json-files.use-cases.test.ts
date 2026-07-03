import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GetWorkspaceJsonFileUseCase } from "./get-workspace-json-file.use-case";
import { ListWorkspaceJsonFilesUseCase } from "./list-workspace-json-files.use-case";
import { SaveWorkspaceJsonFileUseCase } from "./save-workspace-json-file.use-case";
import { FilesystemWorkspaceJsonFileRepository } from "../../infrastructure/filesystem-workspace-json-file.repository";

describe("workspace JSON file use cases", () => {
  let workspaceRoot: string;
  let manifestFile: string;
  let caseFile: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "eval-studio-json-"));
    manifestFile = path.join(workspaceRoot, "manifest.json");
    caseFile = path.join(
      workspaceRoot,
      "suites",
      "refunds",
      "cases",
      "late-refund.case.json",
    );
    await fs.mkdir(path.dirname(caseFile), { recursive: true });
    await fs.writeFile(manifestFile, '{\n  "workspaceName": "Refunds"\n}\n');
    await fs.writeFile(caseFile, '{ "caseId": "late-refund" }');
    await fs.writeFile(path.join(workspaceRoot, "README.md"), "not JSON");
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  function repository() {
    return new FilesystemWorkspaceJsonFileRepository();
  }

  it("lists every JSON file as a sorted workspace-relative path", async () => {
    const files = await new ListWorkspaceJsonFilesUseCase({
      workspaceJsonFileRepository: repository(),
    }).execute({ workspaceRoot });

    expect(files.toPrimitives()).toEqual([
      "manifest.json",
      "suites/refunds/cases/late-refund.case.json",
    ]);
  });

  it("reads the exact raw source of a selected file", async () => {
    const file = await new GetWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository: repository(),
    }).execute({ workspaceRoot, path: "manifest.json" });

    expect(file.toPrimitives()).toEqual({
      path: "manifest.json",
      content: '{\n  "workspaceName": "Refunds"\n}\n',
    });
  });

  it("saves valid raw JSON in place without reformatting it", async () => {
    const content = '{"workspaceName":"Refund experiments","version":2}';
    await new SaveWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository: repository(),
    }).execute({ workspaceRoot, path: "manifest.json", content });

    expect(await fs.readFile(manifestFile, "utf8")).toBe(content);
  });

  it("refuses invalid JSON and leaves the file untouched", async () => {
    const original = await fs.readFile(manifestFile, "utf8");
    const save = new SaveWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository: repository(),
    });

    await expect(
      save.execute({
        workspaceRoot,
        path: "manifest.json",
        content: '{ "workspaceName": ',
      }),
    ).rejects.toThrow("The file must contain valid JSON.");
    expect(await fs.readFile(manifestFile, "utf8")).toBe(original);
  });

  it("does not read files outside the selected workspace", async () => {
    const read = new GetWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository: repository(),
    });

    await expect(
      read.execute({ workspaceRoot, path: "../secret.json" }),
    ).rejects.toThrow("Choose a JSON file inside the workspace.");
  });

  it("does not follow a JSON symlink outside the selected workspace", async () => {
    const outsideDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "eval-studio-outside-"),
    );
    const outsideFile = path.join(outsideDirectory, "secret.json");
    const link = path.join(workspaceRoot, "secret.json");
    await fs.writeFile(outsideFile, '{"secret":true}');
    await fs.symlink(outsideFile, link);

    try {
      const read = new GetWorkspaceJsonFileUseCase({
        workspaceJsonFileRepository: repository(),
      });
      await expect(
        read.execute({ workspaceRoot, path: "secret.json" }),
      ).rejects.toThrow("JSON file does not exist in the workspace.");
    } finally {
      await fs.rm(outsideDirectory, { recursive: true, force: true });
    }
  });
});
