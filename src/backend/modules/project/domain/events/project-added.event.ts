import type { DomainEvent } from "@/backend/modules/shared";
import type { ProjectPrimitives } from "../entities/project.entity";

export class ProjectAddedEvent implements DomainEvent<ProjectPrimitives> {
  readonly eventName = "project_management.project_added.1";
  readonly occurredAt = new Date();

  constructor(private readonly attributes: ProjectPrimitives) {}

  toPrimitives(): ProjectPrimitives {
    return this.attributes;
  }
}
