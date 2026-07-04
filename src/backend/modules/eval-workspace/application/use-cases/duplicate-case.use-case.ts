import { randomUUID } from "node:crypto";
import { EvalCase } from "../../domain/entities/eval-case.entity";
import type { EvalCaseRepository } from "../../domain/repositories/eval-case.repository";
import type { EvalSuiteRepository } from "../../domain/repositories/eval-suite.repository";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";

export type DuplicateCaseInput = {
  workspaceRoot?: string;
  caseId: string;
};

export class DuplicateCaseUseCase {
  constructor(
    private readonly deps: {
      caseRepository: EvalCaseRepository;
      suiteRepository: EvalSuiteRepository;
      idFactory?: () => string;
      now?: () => string;
    },
  ) {}

  async execute(input: DuplicateCaseInput): Promise<EvalCase> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const source = await this.deps.caseRepository.find(
      workspaceRoot,
      CaseId.fromPrimitives(input.caseId),
    );
    const sourcePrimitives = source.toPrimitives();
    const duplicate = EvalCase.fromPrimitives({
      ...sourcePrimitives,
      caseId: (this.deps.idFactory ?? randomUUID)(),
      name: `${sourcePrimitives.name} copy`,
      createdAt: (this.deps.now ?? (() => new Date().toISOString()))(),
      createdBy: {
        source: "eval-studio",
        duplicatedFrom: sourcePrimitives.caseId,
      },
    });

    await this.deps.caseRepository.save(workspaceRoot, duplicate);
    const suite = await this.deps.suiteRepository.find(
      workspaceRoot,
      source.suiteId,
    );
    suite.addCase(duplicate.id.toPrimitives());
    await this.deps.suiteRepository.save(workspaceRoot, suite);
    return duplicate;
  }
}
