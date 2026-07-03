import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";

export class GetActiveProjectUseCase {
  constructor(private readonly deps: { projectRepository: ProjectRepository }) {}

  async execute(): Promise<Project | null> {
    const projects = await this.deps.projectRepository.findAll();
    return projects.find((project) => project.isActive()) ?? null;
  }
}
