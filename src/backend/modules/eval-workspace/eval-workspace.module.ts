import { GetEvalWorkspaceUseCase } from "./application/use-cases/get-eval-workspace.use-case";
import { SaveAnnotationUseCase } from "./application/use-cases/save-annotation.use-case";
import { UpdateCaseUseCase } from "./application/use-cases/update-case.use-case";
import { DeleteCaseUseCase } from "./application/use-cases/delete-case.use-case";
import { DeleteRunAnnotationsUseCase } from "./application/use-cases/delete-run-annotations.use-case";
import { FilesystemEvalWorkspaceRepository } from "./infrastructure/filesystem-eval-workspace.repository";
import { FilesystemEvalAnnotationRepository } from "./infrastructure/filesystem-eval-annotation.repository";
import { FilesystemEvalCaseRepository } from "./infrastructure/filesystem-eval-case.repository";
import { ListWorkspaceJsonFilesUseCase } from "./application/use-cases/list-workspace-json-files.use-case";
import { GetWorkspaceJsonFileUseCase } from "./application/use-cases/get-workspace-json-file.use-case";
import { SaveWorkspaceJsonFileUseCase } from "./application/use-cases/save-workspace-json-file.use-case";
import { FilesystemWorkspaceJsonFileRepository } from "./infrastructure/filesystem-workspace-json-file.repository";

export function createEvalWorkspaceModule() {
  const workspaceRepo = new FilesystemEvalWorkspaceRepository();
  const annotationRepo = new FilesystemEvalAnnotationRepository();
  const caseRepository = new FilesystemEvalCaseRepository();
  const workspaceJsonFileRepository =
    new FilesystemWorkspaceJsonFileRepository();

  return {
    getEvalWorkspace: new GetEvalWorkspaceUseCase(workspaceRepo),
    saveAnnotation: new SaveAnnotationUseCase(annotationRepo),
    updateCase: new UpdateCaseUseCase({ caseRepository }),
    deleteCase: new DeleteCaseUseCase({ caseRepository }),
    deleteRunAnnotations: new DeleteRunAnnotationsUseCase(annotationRepo),
    listWorkspaceJsonFiles: new ListWorkspaceJsonFilesUseCase({
      workspaceJsonFileRepository,
    }),
    getWorkspaceJsonFile: new GetWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository,
    }),
    saveWorkspaceJsonFile: new SaveWorkspaceJsonFileUseCase({
      workspaceJsonFileRepository,
    }),
  };
}
