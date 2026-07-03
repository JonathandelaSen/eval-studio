import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";

export class ListProjectsUseCase {
  constructor(private readonly deps: { projectRepository: ProjectRepository }) {}

  execute(): Promise<Project[]> {
    return this.deps.projectRepository.findAll();
  }
}
