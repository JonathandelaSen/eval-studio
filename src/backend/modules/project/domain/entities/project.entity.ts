import { AggregateRoot } from "@/backend/modules/shared";
import { ProjectActive } from "../value-objects/project-active.value-object";
import { ProjectDirectory } from "../value-objects/project-directory.value-object";
import { ProjectId } from "../value-objects/project-id.value-object";
import { ProjectName } from "../value-objects/project-name.value-object";
import { ProjectAddedEvent } from "../events/project-added.event";
import { ProjectRemovedEvent } from "../events/project-removed.event";
import { ProjectSelectedEvent } from "../events/project-selected.event";

export interface ProjectPrimitives {
  projectId: string;
  name: string;
  directory: string;
  active: boolean;
}

export interface ProjectCreateParams {
  id: ProjectId;
  name: ProjectName;
  directory: ProjectDirectory;
  active: ProjectActive;
}

export class Project extends AggregateRoot {
  private constructor(
    private readonly projectIdValue: ProjectId,
    private readonly nameValue: ProjectName,
    private readonly directoryValue: ProjectDirectory,
    private activeValue: ProjectActive,
  ) {
    super();
  }

  static create(input: ProjectCreateParams): Project {
    const project = new Project(input.id, input.name, input.directory, input.active);
    project.recordDomainEvent(new ProjectAddedEvent(project.toPrimitives()));
    return project;
  }

  static fromPrimitives(primitives: ProjectPrimitives): Project {
    return new Project(
      ProjectId.fromPrimitives(primitives.projectId),
      ProjectName.fromPrimitives(primitives.name),
      ProjectDirectory.fromPrimitives(primitives.directory),
      ProjectActive.fromPrimitives(primitives.active),
    );
  }

  get id(): ProjectId {
    return this.projectIdValue;
  }

  isActive(): boolean {
    return this.activeValue.toPrimitives();
  }

  activate(): void {
    if (this.isActive()) return;
    this.activeValue = ProjectActive.fromPrimitives(true);
    this.recordDomainEvent(new ProjectSelectedEvent(this.toPrimitives()));
  }

  deactivate(): void {
    this.activeValue = ProjectActive.inactive();
  }

  remove(): void {
    this.recordDomainEvent(new ProjectRemovedEvent(this.toPrimitives()));
  }

  toPrimitives(): ProjectPrimitives {
    return {
      projectId: this.projectIdValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      directory: this.directoryValue.toPrimitives(),
      active: this.activeValue.toPrimitives(),
    };
  }
}
