import { EvalAnnotation } from "../entities/eval-annotation.entity";
import { EvalWorkspaceSnapshot } from "../entities/eval-workspace-snapshot.entity";

export interface EvalWorkspaceRepository {
  scan(): Promise<EvalWorkspaceSnapshot>;
  saveAnnotation(annotation: EvalAnnotation): Promise<EvalAnnotation>;
}
