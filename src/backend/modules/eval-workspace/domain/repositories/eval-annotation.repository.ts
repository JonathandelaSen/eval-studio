import { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import { EvalAnnotation } from "../entities/eval-annotation.entity";

export interface EvalAnnotationRepository {
  save(
    workspaceRoot: WorkspaceRoot | undefined,
    annotation: EvalAnnotation,
  ): Promise<EvalAnnotation>;
}
