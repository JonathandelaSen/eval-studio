import { WorkspaceRoot } from "../value-objects/workspace-root.value-object";
import { CaseId } from "../value-objects/case-id.value-object";
import { EvalCase } from "../entities/eval-case.entity";

export interface EvalCaseRepository {
  find(workspaceRoot: WorkspaceRoot | undefined, caseId: CaseId): Promise<EvalCase>;
  save(workspaceRoot: WorkspaceRoot | undefined, evalCase: EvalCase): Promise<EvalCase>;
  delete(workspaceRoot: WorkspaceRoot | undefined, caseId: CaseId): Promise<CaseId>;
}
