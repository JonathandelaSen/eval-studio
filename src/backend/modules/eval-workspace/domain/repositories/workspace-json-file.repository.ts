import type { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import type { WorkspaceJsonFile } from "../value-objects/workspace-json-file.value-object";
import type { WorkspaceJsonFiles } from "../value-objects/workspace-json-files.value-object";

export interface WorkspaceJsonFileRepository {
  list(workspaceRoot: WorkspaceRoot | undefined): Promise<WorkspaceJsonFiles>;
  get(
    workspaceRoot: WorkspaceRoot | undefined,
    file: WorkspaceJsonFile,
  ): Promise<WorkspaceJsonFile>;
  save(
    workspaceRoot: WorkspaceRoot | undefined,
    file: WorkspaceJsonFile,
  ): Promise<WorkspaceJsonFile>;
}
