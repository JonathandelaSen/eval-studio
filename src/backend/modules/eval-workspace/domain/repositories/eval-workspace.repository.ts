import { EvalAnnotation } from "../entities/eval-annotation.entity";
import { EvalWorkspace } from "../entities/eval-workspace.entity";

export interface EvalWorkspaceRepository {
  scan(): Promise<EvalWorkspace>;
  saveAnnotation(annotation: EvalAnnotation): Promise<EvalAnnotation>;
}
