import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalWorkspace } from "../../domain/entities/eval-workspace.entity";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";

export type GetEvalWorkspaceInput = {
  workspaceRoot?: string;
};

export class GetEvalWorkspaceUseCase {
  constructor(private readonly repo: EvalWorkspaceRepository) {}

  execute(input?: GetEvalWorkspaceInput): Promise<EvalWorkspace> {
    const workspaceRoot = input?.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    return this.repo.get(workspaceRoot);
  }
}
