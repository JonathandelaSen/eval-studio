import type { EventBus } from "@/backend/modules/shared";
import { AddProjectUseCase } from "./application/use-cases/add-project.use-case";
import { GetActiveProjectUseCase } from "./application/use-cases/get-active-project.use-case";
import { ListDirectoriesUseCase } from "./application/use-cases/list-directories.use-case";
import { ListProjectsUseCase } from "./application/use-cases/list-projects.use-case";
import { RemoveProjectUseCase } from "./application/use-cases/remove-project.use-case";
import { SelectProjectUseCase } from "./application/use-cases/select-project.use-case";
import { ProjectDirectory } from "./domain/value-objects/project-directory.value-object";
import { FilesystemProjectRepository } from "./infrastructure/repositories/filesystem-project.repository";
import { FilesystemDirectoryBrowserService } from "./infrastructure/services/filesystem-directory-browser.service";
import { FilesystemProjectMetadataService } from "./infrastructure/services/filesystem-project-metadata.service";

export function createProjectModule(config: {
  settingsFile: string;
  homeDirectory: string;
  eventBus: EventBus;
}) {
  const projectRepository = new FilesystemProjectRepository(config.settingsFile);
  const projectMetadataService = new FilesystemProjectMetadataService();
  const directoryBrowserService = new FilesystemDirectoryBrowserService();

  return {
    addProject: new AddProjectUseCase({
      projectRepository,
      projectMetadataService,
      eventBus: config.eventBus,
    }),
    listProjects: new ListProjectsUseCase({ projectRepository }),
    getActiveProject: new GetActiveProjectUseCase({ projectRepository }),
    selectProject: new SelectProjectUseCase({
      projectRepository,
      eventBus: config.eventBus,
    }),
    removeProject: new RemoveProjectUseCase({
      projectRepository,
      eventBus: config.eventBus,
    }),
    listDirectories: new ListDirectoriesUseCase({
      directoryBrowserService,
      homeDirectory: ProjectDirectory.fromPrimitives(config.homeDirectory),
    }),
  };
}
