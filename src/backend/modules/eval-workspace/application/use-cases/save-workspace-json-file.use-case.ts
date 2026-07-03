import type { WorkspaceJsonFileRepository } from "../../domain/repositories/workspace-json-file.repository";
import { WorkspaceJsonFile } from "../../domain/value-objects/workspace-json-file.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";

export interface SaveWorkspaceJsonFileInput {
  workspaceRoot?: string;
  path: string;
  content: string;
}

export class SaveWorkspaceJsonFileUseCase {
  constructor(
    private readonly deps: {
      workspaceJsonFileRepository: WorkspaceJsonFileRepository;
    },
  ) {}

  async execute(input: SaveWorkspaceJsonFileInput): Promise<WorkspaceJsonFile> {
    const root = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const file = WorkspaceJsonFile.fromValidJson({
      path: input.path,
      content: input.content,
    });
    return this.deps.workspaceJsonFileRepository.save(root, file);
  }
}
