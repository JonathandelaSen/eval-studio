import { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import { EvalRun } from "../entities/eval-run.entity";

export interface EvalRunRepository {
  save(workspaceRoot: WorkspaceRoot | undefined, run: EvalRun): Promise<EvalRun>;
}
