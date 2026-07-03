import { describe, expect, it } from "vitest";
import type { WorkspaceJsonFileRepository } from "../../domain/repositories/workspace-json-file.repository";
import type { WorkspaceJsonFile } from "../../domain/value-objects/workspace-json-file.value-object";
import { WorkspaceJsonFiles } from "../../domain/value-objects/workspace-json-files.value-object";
import { ListWorkspaceJsonFilesUseCase } from "./list-workspace-json-files.use-case";

describe("ListWorkspaceJsonFilesUseCase", () => {
  it("lists files through the workspace repository", async () => {
    const repository: WorkspaceJsonFileRepository = {
      list: async () => WorkspaceJsonFiles.fromPrimitives(["manifest.json"]),
      get: async (_root, file: WorkspaceJsonFile) => file,
      save: async (_root, file: WorkspaceJsonFile) => file,
    };

    const result = await new ListWorkspaceJsonFilesUseCase({
      workspaceJsonFileRepository: repository,
    }).execute({ workspaceRoot: "/tmp/evals" });

    expect(result.toPrimitives()).toEqual(["manifest.json"]);
  });
});
