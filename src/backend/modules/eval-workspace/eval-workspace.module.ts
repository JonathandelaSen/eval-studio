import { GetEvalWorkspaceUseCase } from "./application/use-cases/get-eval-workspace.use-case";
import { SaveAnnotationUseCase } from "./application/use-cases/save-annotation.use-case";
import { FilesystemEvalWorkspaceRepository } from "./infrastructure/filesystem-eval-workspace.repository";
import { FilesystemEvalAnnotationRepository } from "./infrastructure/filesystem-eval-annotation.repository";

export function createEvalWorkspaceModule() {
  const workspaceRepo = new FilesystemEvalWorkspaceRepository();
  const annotationRepo = new FilesystemEvalAnnotationRepository();

  return {
    getEvalWorkspace: new GetEvalWorkspaceUseCase(workspaceRepo),
    saveAnnotation: new SaveAnnotationUseCase(annotationRepo),
  };
}
