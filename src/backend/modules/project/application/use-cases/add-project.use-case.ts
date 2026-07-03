import type { EventBus } from "@/backend/modules/shared";
import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";
import type { ProjectMetadataService } from "../../domain/services/project-metadata.service";
import { ProjectActive } from "../../domain/value-objects/project-active.value-object";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { ProjectId } from "../../domain/value-objects/project-id.value-object";
import { ProjectName } from "../../domain/value-objects/project-name.value-object";

export type AddProjectInput = { directory: string };

export class AddProjectUseCase {
  constructor(
    private readonly deps: {
      projectRepository: ProjectRepository;
      projectMetadataService: ProjectMetadataService;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: AddProjectInput): Promise<Project> {
    const metadata = await this.deps.projectMetadataService.inspect(
      ProjectDirectory.fromPrimitives(input.directory),
    );
    const primitives = metadata.toPrimitives();
    const directory = ProjectDirectory.fromPrimitives(primitives.directory);
    const existing = await this.deps.projectRepository.findByDirectory(directory);
    if (existing) return existing;

    const projects = await this.deps.projectRepository.findAll();
    const project = Project.create({
      id: ProjectId.create(),
      name: ProjectName.fromPrimitives(primitives.name),
      directory,
      active: ProjectActive.fromPrimitives(projects.length === 0),
    });
    await this.deps.projectRepository.save(project);
    await this.deps.eventBus.publish(project.pullDomainEvents());
    return project;
  }
}
