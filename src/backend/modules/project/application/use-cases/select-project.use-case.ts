import type { EventBus } from "@/backend/modules/shared";
import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";
import { ProjectNotFoundError } from "../../domain/errors/project-not-found.error";
import { ProjectId } from "../../domain/value-objects/project-id.value-object";

export type SelectProjectInput = { projectId: string };

export class SelectProjectUseCase {
  constructor(
    private readonly deps: {
      projectRepository: ProjectRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: SelectProjectInput): Promise<Project> {
    const id = ProjectId.fromPrimitives(input.projectId);
    const projects = await this.deps.projectRepository.findAll();
    const selected = projects.find((project) => project.id.equals(id));
    if (!selected) throw new ProjectNotFoundError();

    for (const project of projects) {
      if (project.id.equals(id)) project.activate();
      else project.deactivate();
    }
    await this.deps.projectRepository.replaceAll(projects);
    await this.deps.eventBus.publish(selected.pullDomainEvents());
    return selected;
  }
}
