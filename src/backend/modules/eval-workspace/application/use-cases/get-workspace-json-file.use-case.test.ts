import { describe, expect, it } from "vitest";
import type { WorkspaceJsonFileRepository } from "../../domain/repositories/workspace-json-file.repository";
import { WorkspaceJsonFile } from "../../domain/value-objects/workspace-json-file.value-object";
import { WorkspaceJsonFiles } from "../../domain/value-objects/workspace-json-files.value-object";
import { GetWorkspaceJsonFileUseCase } from "./get-workspace-json-file.use-case";

describe("GetWorkspaceJsonFileUseCase", () => {
  it("reads the selected relative JSON path", async () => {
    const repository: WorkspaceJsonFileRepository = {
      list: async () => WorkspaceJsonFiles.fromPrimitives([]),
      get: async (_root, file) =>
        WorkspaceJsonFile.fromPrimitives({
          path: file.toPrimitives().path,
          content: "{}",
        }),
      save: async (_root, file: WorkspaceJsonFile) => file,
    };

    const result = await new GetWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository: repository,
    }).execute({ workspaceRoot: "/tmp/evals", path: "manifest.json" });

    expect(result.toPrimitives()).toEqual({
      path: "manifest.json",
      content: "{}",
    });
  });
});
