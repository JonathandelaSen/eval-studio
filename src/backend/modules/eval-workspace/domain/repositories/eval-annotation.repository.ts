import { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { EvalAnnotation } from "../entities/eval-annotation.entity";

export interface EvalAnnotationRepository {
  save(
    workspaceRoot: WorkspaceRoot | undefined,
    annotation: EvalAnnotation,
  ): Promise<EvalAnnotation>;
  deleteByRun(
    workspaceRoot: WorkspaceRoot | undefined,
    runId: EvalRunId,
  ): Promise<EvalRunId>;
}
