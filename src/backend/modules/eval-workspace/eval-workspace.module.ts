import { GetEvalWorkspaceUseCase } from "./application/use-cases/get-eval-workspace.use-case";
import { SaveAnnotationUseCase } from "./application/use-cases/save-annotation.use-case";
import { FilesystemEvalWorkspaceRepository } from "./infrastructure/filesystem-eval-workspace.repository";

export function createEvalWorkspaceModule(config: { workspaceRoot?: string }) {
  const repo = new FilesystemEvalWorkspaceRepository(config.workspaceRoot);

  return {
    getEvalWorkspace: new GetEvalWorkspaceUseCase(repo),
    saveAnnotation: new SaveAnnotationUseCase(repo),
  };
}
