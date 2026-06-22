import { GetEvalWorkspaceSnapshotUseCase } from "./application/use-cases/get-eval-workspace-snapshot.use-case";
import { SaveAnnotationUseCase } from "./application/use-cases/save-annotation.use-case";
import { FilesystemEvalWorkspaceRepository } from "./infrastructure/filesystem-eval-workspace.repository";

export function createEvalWorkspaceModule(config: { workspaceRoot?: string }) {
  const repo = new FilesystemEvalWorkspaceRepository(config.workspaceRoot);

  return {
    getEvalWorkspaceSnapshot: new GetEvalWorkspaceSnapshotUseCase(repo),
    saveAnnotation: new SaveAnnotationUseCase(repo),
  };
}
