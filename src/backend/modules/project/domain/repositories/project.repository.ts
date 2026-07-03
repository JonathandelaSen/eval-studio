import { Project } from "../entities/project.entity";
import { ProjectDirectory } from "../value-objects/project-directory.value-object";
import { ProjectId } from "../value-objects/project-id.value-object";

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: ProjectId): Promise<Project | null>;
  findByDirectory(directory: ProjectDirectory): Promise<Project | null>;
  save(project: Project): Promise<Project>;
  replaceAll(projects: Project[]): Promise<Project[]>;
}
