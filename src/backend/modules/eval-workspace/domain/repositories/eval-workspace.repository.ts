import { EvalAnnotation } from "../entities/eval-annotation.entity";
import { EvalWorkspace } from "../entities/eval-workspace.entity";

export interface EvalWorkspaceRepository {
  get(): Promise<EvalWorkspace>;
  saveAnnotation(annotation: EvalAnnotation): Promise<EvalAnnotation>;
}
