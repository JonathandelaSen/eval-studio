import type { EvalSuite } from "../entities/eval-suite.entity";
import type { SuiteId } from "../value-objects/suite-id.value-object";
import type { WorkspaceRoot } from "../value-objects/workspace-root.value-object";

export interface EvalSuiteRepository {
  find(root: WorkspaceRoot | undefined, suiteId: SuiteId): Promise<EvalSuite>;
  save(root: WorkspaceRoot | undefined, suite: EvalSuite): Promise<EvalSuite>;
  delete(root: WorkspaceRoot | undefined, suiteId: SuiteId): Promise<SuiteId>;
}
