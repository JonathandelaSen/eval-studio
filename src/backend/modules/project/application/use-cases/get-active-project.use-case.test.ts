import { describe, expect, it } from "vitest";
import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { ProjectId } from "../../domain/value-objects/project-id.value-object";
import { GetActiveProjectUseCase } from "./get-active-project.use-case";

describe("GetActiveProjectUseCase", () => {
  it("returns the active project", async () => {
    const inactive = buildProject(false);
    const active = buildProject(true, "a74af800-c64b-45f1-a728-a259687f16aa");
    const useCase = new GetActiveProjectUseCase({
      projectRepository: new ProjectRepositoryStub([inactive, active]),
    });

    await expect(useCase.execute()).resolves.toEqual(active);
  });

  it("returns null when no project is active", async () => {
    const useCase = new GetActiveProjectUseCase({
      projectRepository: new ProjectRepositoryStub([]),
    });

    await expect(useCase.execute()).resolves.toBeNull();
  });
});

class ProjectRepositoryStub implements ProjectRepository {
  constructor(private projects: Project[]) {}
  findAll(): Promise<Project[]> { return Promise.resolve(this.projects); }
  findById(id: ProjectId): Promise<Project | null> { void id; return Promise.resolve(null); }
  findByDirectory(directory: ProjectDirectory): Promise<Project | null> { void directory; return Promise.resolve(null); }
  save(project: Project): Promise<Project> { return Promise.resolve(project); }
  replaceAll(projects: Project[]): Promise<Project[]> { this.projects = projects; return Promise.resolve(projects); }
}

function buildProject(active: boolean, projectId = "21d5cbe4-21fb-44be-8b3c-e65f99b721f5") {
  return Project.fromPrimitives({ projectId, name: "Fabra", directory: `/tmp/${projectId}`, active });
}
