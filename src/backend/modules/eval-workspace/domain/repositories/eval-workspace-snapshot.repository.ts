import { EvalWorkspaceSnapshot } from "../entities/eval-workspace-snapshot.entity";

export interface EvalWorkspaceSnapshotRepository {
  scan(): Promise<EvalWorkspaceSnapshot>;
}
