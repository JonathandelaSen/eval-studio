import { AggregateRoot } from "@/backend/modules/shared";
import type { EvalWorkspaceSnapshot as EvalWorkspaceSnapshotArtifactPrimitives } from "../artifacts";

export interface EvalWorkspaceSnapshotPrimitives {
  workspaceRoot: string | null;
  manifest: EvalWorkspaceSnapshotArtifactPrimitives["manifest"];
  suites: EvalWorkspaceSnapshotArtifactPrimitives["suites"];
  cases: EvalWorkspaceSnapshotArtifactPrimitives["cases"];
  runs: EvalWorkspaceSnapshotArtifactPrimitives["runs"];
  results: EvalWorkspaceSnapshotArtifactPrimitives["results"];
  annotations: EvalWorkspaceSnapshotArtifactPrimitives["annotations"];
  diagnostics: EvalWorkspaceSnapshotArtifactPrimitives["diagnostics"];
}

export class EvalWorkspaceSnapshot extends AggregateRoot {
  private constructor(private readonly primitives: EvalWorkspaceSnapshotPrimitives) {
    super();
  }

  static fromPrimitives(primitives: EvalWorkspaceSnapshotPrimitives): EvalWorkspaceSnapshot {
    return new EvalWorkspaceSnapshot(primitives);
  }

  toPrimitives(): EvalWorkspaceSnapshotPrimitives {
    return this.primitives;
  }
}
