import { EvalWorkspaceSnapshot } from "../../domain/entities/eval-workspace-snapshot.entity";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";

export class GetEvalWorkspaceSnapshotUseCase {
  constructor(private readonly repo: EvalWorkspaceRepository) {}

  execute(): Promise<EvalWorkspaceSnapshot> {
    return this.repo.scan();
  }
}
