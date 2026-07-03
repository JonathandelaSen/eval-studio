import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import type { EvalCaseRepository } from "../../domain/repositories/eval-case.repository";
import type { EvalSuiteRepository } from "../../domain/repositories/eval-suite.repository";

export type DeleteCaseInput = {
  workspaceRoot?: string;
  caseId: string;
};

export class DeleteCaseUseCase {
  constructor(private readonly deps: {
    caseRepository: EvalCaseRepository;
    suiteRepository?: EvalSuiteRepository;
  }) {}

  async execute(input: DeleteCaseInput): Promise<CaseId> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const caseId = CaseId.fromPrimitives(input.caseId);
    const existing = await this.deps.caseRepository.find(workspaceRoot, caseId);
    const deleted = await this.deps.caseRepository.delete(workspaceRoot, caseId);
    if (this.deps.suiteRepository) {
      const suite = await this.deps.suiteRepository.find(workspaceRoot, existing.suiteId);
      suite.removeCase(caseId.toPrimitives());
      await this.deps.suiteRepository.save(workspaceRoot, suite);
    }
    return deleted;
  }
}
