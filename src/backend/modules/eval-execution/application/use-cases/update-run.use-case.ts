import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalRunId } from "../../domain/value-objects/eval-run-id.value-object";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

export type UpdateRunInput = {
  workspaceRoot?: string;
  runId: string;
  name?: string;
  notes?: string | null;
};

export class UpdateRunUseCase {
  constructor(private readonly deps: { runRepository: EvalRunRepository }) {}

  async execute(input: UpdateRunInput): Promise<EvalRun> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const runId = EvalRunId.fromPrimitives(input.runId);
    const existing = await this.deps.runRepository.find(workspaceRoot, runId);
    const primitives = existing.toPrimitives();
    const updated = EvalRun.fromPrimitives({
      ...primitives,
      name: input.name ?? primitives.name,
      notes: input.notes === undefined ? primitives.notes : input.notes,
    });
    return this.deps.runRepository.save(workspaceRoot, updated);
  }
}
