import { EvalWorkspace } from "../../domain/entities/eval-workspace.entity";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";

export class GetEvalWorkspaceUseCase {
  constructor(private readonly repo: EvalWorkspaceRepository) {}

  execute(): Promise<EvalWorkspace> {
    return this.repo.get();
  }
}
