import { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import { EvalResult } from "../entities/eval-result.entity";

export interface EvalResultRepository {
  save(workspaceRoot: WorkspaceRoot | undefined, result: EvalResult): Promise<EvalResult>;
}
