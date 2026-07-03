import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalRunId } from "../../domain/value-objects/eval-run-id.value-object";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

export type DeleteRunInput = {
  workspaceRoot?: string;
  runId: string;
};

export class DeleteRunUseCase {
  constructor(private readonly deps: { runRepository: EvalRunRepository }) {}

  async execute(input: DeleteRunInput): Promise<EvalRunId> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const runId = EvalRunId.fromPrimitives(input.runId);
    return this.deps.runRepository.delete(workspaceRoot, runId);
  }
}
