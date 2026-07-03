import { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { EvalRun } from "../entities/eval-run.entity";

export interface EvalRunRepository {
  save(workspaceRoot: WorkspaceRoot | undefined, run: EvalRun): Promise<EvalRun>;
  find(workspaceRoot: WorkspaceRoot | undefined, runId: EvalRunId): Promise<EvalRun>;
  delete(workspaceRoot: WorkspaceRoot | undefined, runId: EvalRunId): Promise<EvalRunId>;
}
