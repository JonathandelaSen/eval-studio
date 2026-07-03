import { describe, expect, it } from "vitest";
import { Project } from "./project.entity";
import { ProjectActive } from "../value-objects/project-active.value-object";
import { ProjectDirectory } from "../value-objects/project-directory.value-object";
import { ProjectId } from "../value-objects/project-id.value-object";
import { ProjectName } from "../value-objects/project-name.value-object";

const projectId = "21d5cbe4-21fb-44be-8b3c-e65f99b721f5";

describe("Project", () => {
  it("creates a project and records the added event", () => {
    const project = Project.create({
      id: ProjectId.fromPrimitives(projectId),
      name: ProjectName.fromPrimitives("Fabra evaluations"),
      directory: ProjectDirectory.fromPrimitives("/tmp/fabra/evals"),
      active: ProjectActive.inactive(),
    });

    expect(project.toPrimitives()).toEqual({
      projectId,
      name: "Fabra evaluations",
      directory: "/tmp/fabra/evals",
      active: false,
    });
    expect(project.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "project_management.project_added.1",
    ]);
  });

  it("hydrates and round-trips persisted projects", () => {
    const primitives = {
      projectId,
      name: "Fabra evaluations",
      directory: "/tmp/fabra/evals",
      active: true,
    };

    const project = Project.fromPrimitives(primitives);

    expect(project.id.toPrimitives()).toBe(projectId);
    expect(project.isActive()).toBe(true);
    expect(project.toPrimitives()).toEqual(primitives);
    expect(project.pullDomainEvents()).toEqual([]);
  });

  it("records selection only when becoming active", () => {
    const project = Project.fromPrimitives({
      projectId,
      name: "Fabra evaluations",
      directory: "/tmp/fabra/evals",
      active: false,
    });

    project.activate();
    project.activate();

    expect(project.isActive()).toBe(true);
    expect(project.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "project_management.project_selected.1",
    ]);
  });

  it("deactivates without recording a selection event", () => {
    const project = Project.fromPrimitives({
      projectId,
      name: "Fabra evaluations",
      directory: "/tmp/fabra/evals",
      active: true,
    });

    project.deactivate();

    expect(project.isActive()).toBe(false);
    expect(project.pullDomainEvents()).toEqual([]);
  });

  it("records removal", () => {
    const project = Project.fromPrimitives({
      projectId,
      name: "Fabra evaluations",
      directory: "/tmp/fabra/evals",
      active: true,
    });

    project.remove();

    expect(project.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "project_management.project_removed.1",
    ]);
  });
});
