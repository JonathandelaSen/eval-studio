import { describe, expect, it } from "vitest";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";
import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { ProjectId } from "../../domain/value-objects/project-id.value-object";
import { RemoveProjectUseCase } from "./remove-project.use-case";

describe("RemoveProjectUseCase", () => {
  it("removes the active project and activates the next one", async () => {
    const first = buildProject(true, "21d5cbe4-21fb-44be-8b3c-e65f99b721f5");
    const second = buildProject(false, "a74af800-c64b-45f1-a728-a259687f16aa");
    const repository = new ProjectRepositoryStub([first, second]);
    const eventBus = new InMemoryEventBus(new NoOpTelemetry());
    const useCase = new RemoveProjectUseCase({ projectRepository: repository, eventBus });

    const remaining = await useCase.execute({ projectId: first.id.toPrimitives() });

    expect(remaining).toEqual([second]);
    expect(second.isActive()).toBe(true);
    expect(eventBus.getEvents().map((event) => event.eventName)).toEqual([
      "project_management.project_removed.1",
      "project_management.project_selected.1",
    ]);
  });

  it("rejects an unknown project", async () => {
    const useCase = new RemoveProjectUseCase({
      projectRepository: new ProjectRepositoryStub([]),
      eventBus: new InMemoryEventBus(new NoOpTelemetry()),
    });

    await expect(
      useCase.execute({ projectId: "21d5cbe4-21fb-44be-8b3c-e65f99b721f5" }),
    ).rejects.toThrow("Project does not exist.");
  });
});

class ProjectRepositoryStub implements ProjectRepository {
  constructor(public projects: Project[]) {}
  findAll(): Promise<Project[]> { return Promise.resolve(this.projects); }
  findById(id: ProjectId): Promise<Project | null> { return Promise.resolve(this.projects.find((project) => project.id.equals(id)) ?? null); }
  findByDirectory(directory: ProjectDirectory): Promise<Project | null> { void directory; return Promise.resolve(null); }
  save(project: Project): Promise<Project> { return Promise.resolve(project); }
  replaceAll(projects: Project[]): Promise<Project[]> { this.projects = projects; return Promise.resolve(projects); }
}

function buildProject(active: boolean, projectId: string) {
  return Project.fromPrimitives({ projectId, name: projectId, directory: `/tmp/${projectId}`, active });
}
