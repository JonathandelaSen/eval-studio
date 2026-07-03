import type { EventBus } from "@/backend/modules/shared";
import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";
import { ProjectNotFoundError } from "../../domain/errors/project-not-found.error";
import { ProjectId } from "../../domain/value-objects/project-id.value-object";

export type RemoveProjectInput = { projectId: string };

export class RemoveProjectUseCase {
  constructor(
    private readonly deps: {
      projectRepository: ProjectRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: RemoveProjectInput): Promise<Project[]> {
    const id = ProjectId.fromPrimitives(input.projectId);
    const projects = await this.deps.projectRepository.findAll();
    const removed = projects.find((project) => project.id.equals(id));
    if (!removed) throw new ProjectNotFoundError();

    removed.remove();
    const remaining = projects.filter((project) => !project.id.equals(id));
    if (removed.isActive() && remaining.length > 0) remaining[0].activate();
    await this.deps.projectRepository.replaceAll(remaining);
    await this.deps.eventBus.publish([
      ...removed.pullDomainEvents(),
      ...remaining.flatMap((project) => project.pullDomainEvents()),
    ]);
    return remaining;
  }
}
