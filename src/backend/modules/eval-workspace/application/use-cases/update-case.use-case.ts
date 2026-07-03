import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import { EvalCase } from "../../domain/entities/eval-case.entity";
import type { EvalCaseRepository } from "../../domain/repositories/eval-case.repository";

export type UpdateCaseInput = {
  workspaceRoot?: string;
  caseId: string;
  name?: string;
  note?: string | null;
};

export class UpdateCaseUseCase {
  constructor(private readonly deps: { caseRepository: EvalCaseRepository }) {}

  async execute(input: UpdateCaseInput): Promise<EvalCase> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const caseId = CaseId.fromPrimitives(input.caseId);
    const existing = await this.deps.caseRepository.find(workspaceRoot, caseId);
    const primitives = existing.toPrimitives();
    const updated = EvalCase.fromPrimitives({
      ...primitives,
      name: input.name ?? primitives.name,
      note:
        input.note === undefined ? primitives.note : input.note ?? undefined,
    });
    return this.deps.caseRepository.save(workspaceRoot, updated);
  }
}
