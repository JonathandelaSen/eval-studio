import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import type { EvalCaseRepository } from "../../domain/repositories/eval-case.repository";

export type DeleteCaseInput = {
  workspaceRoot?: string;
  caseId: string;
};

export class DeleteCaseUseCase {
  constructor(private readonly deps: { caseRepository: EvalCaseRepository }) {}

  async execute(input: DeleteCaseInput): Promise<CaseId> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const caseId = CaseId.fromPrimitives(input.caseId);
    return this.deps.caseRepository.delete(workspaceRoot, caseId);
  }
}
