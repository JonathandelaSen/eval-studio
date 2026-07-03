import type { WorkspaceJsonFileRepository } from "../../domain/repositories/workspace-json-file.repository";
import { WorkspaceJsonFiles } from "../../domain/value-objects/workspace-json-files.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";

export interface ListWorkspaceJsonFilesInput {
  workspaceRoot?: string;
}

export class ListWorkspaceJsonFilesUseCase {
  constructor(
    private readonly deps: {
      workspaceJsonFileRepository: WorkspaceJsonFileRepository;
    },
  ) {}

  execute(input: ListWorkspaceJsonFilesInput): Promise<WorkspaceJsonFiles> {
    const root = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    return this.deps.workspaceJsonFileRepository.list(root);
  }
}
