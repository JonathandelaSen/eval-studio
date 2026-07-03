import { describe, expect, it } from "vitest";
import type { WorkspaceJsonFileRepository } from "../../domain/repositories/workspace-json-file.repository";
import type { WorkspaceJsonFile } from "../../domain/value-objects/workspace-json-file.value-object";
import { WorkspaceJsonFiles } from "../../domain/value-objects/workspace-json-files.value-object";
import { SaveWorkspaceJsonFileUseCase } from "./save-workspace-json-file.use-case";

describe("SaveWorkspaceJsonFileUseCase", () => {
  it("validates and saves the complete raw JSON document", async () => {
    let saved: WorkspaceJsonFile | undefined;
    const repository: WorkspaceJsonFileRepository = {
      list: async () => WorkspaceJsonFiles.fromPrimitives([]),
      get: async (_root, file: WorkspaceJsonFile) => file,
      save: async (_root, file) => {
        saved = file;
        return file;
      },
    };

    await new SaveWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository: repository,
    }).execute({
      workspaceRoot: "/tmp/evals",
      path: "manifest.json",
      content: '{"workspaceName":"Evals"}',
    });

    expect(saved?.toPrimitives().content).toBe('{"workspaceName":"Evals"}');
  });
});
