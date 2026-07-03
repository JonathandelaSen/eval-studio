import { describe, expect, it } from "vitest";
import { Project } from "../../domain/entities/project.entity";
import type { ProjectRepository } from "../../domain/repositories/project.repository";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { ProjectId } from "../../domain/value-objects/project-id.value-object";
import { ListProjectsUseCase } from "./list-projects.use-case";

describe("ListProjectsUseCase", () => {
  it("returns projects from the repository", async () => {
    const project = buildProject();
    const useCase = new ListProjectsUseCase({
      projectRepository: new ProjectRepositoryStub([project]),
    });

    await expect(useCase.execute()).resolves.toEqual([project]);
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

function buildProject() {
  return Project.fromPrimitives({
    projectId: "21d5cbe4-21fb-44be-8b3c-e65f99b721f5",
    name: "Fabra",
    directory: "/tmp/fabra",
    active: true,
  });
}
