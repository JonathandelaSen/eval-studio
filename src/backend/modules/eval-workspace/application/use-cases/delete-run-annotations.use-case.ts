import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalRunId } from "../../domain/value-objects/eval-run-id.value-object";
import type { EvalAnnotationRepository } from "../../domain/repositories/eval-annotation.repository";

export type DeleteRunAnnotationsInput = {
  workspaceRoot?: string;
  runId: string;
};

export class DeleteRunAnnotationsUseCase {
  constructor(private readonly repo: EvalAnnotationRepository) {}

  async execute(input: DeleteRunAnnotationsInput): Promise<EvalRunId> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const runId = EvalRunId.fromPrimitives(input.runId);
    return this.repo.deleteByRun(workspaceRoot, runId);
  }
}
