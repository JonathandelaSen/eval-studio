import type { WorkspaceJsonFileRepository } from "../../domain/repositories/workspace-json-file.repository";
import { WorkspaceJsonFile } from "../../domain/value-objects/workspace-json-file.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";

export interface GetWorkspaceJsonFileInput {
  workspaceRoot?: string;
  path: string;
}

export class GetWorkspaceJsonFileUseCase {
  constructor(
    private readonly deps: {
      workspaceJsonFileRepository: WorkspaceJsonFileRepository;
    },
  ) {}

  async execute(input: GetWorkspaceJsonFileInput): Promise<WorkspaceJsonFile> {
    const root = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const file = WorkspaceJsonFile.fromPrimitives({
      path: input.path,
      content: "",
    });
    return this.deps.workspaceJsonFileRepository.get(root, file);
  }
}
