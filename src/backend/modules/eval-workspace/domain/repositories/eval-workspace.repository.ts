import { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import { EvalWorkspace } from "../entities/eval-workspace.entity";

export interface EvalWorkspaceRepository {
  get(workspaceRoot?: WorkspaceRoot): Promise<EvalWorkspace>;
}
