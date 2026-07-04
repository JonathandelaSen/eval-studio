import type { EvalSuiteRepository } from "../../domain/repositories/eval-suite.repository";
import { SuiteId } from "../../domain/value-objects/suite-id.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";

export type DeleteSuiteInput = {
  workspaceRoot?: string;
  suiteId: string;
};

export class DeleteSuiteUseCase {
  constructor(
    private readonly deps: { suiteRepository: EvalSuiteRepository },
  ) {}

  async execute(input: DeleteSuiteInput): Promise<SuiteId> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const suiteId = SuiteId.fromPrimitives(input.suiteId);
    return this.deps.suiteRepository.delete(workspaceRoot, suiteId);
  }
}
