import { describe, expect, it } from "vitest";
import {
  toProjectResponse,
  toProjectRegistryResponse,
} from "./responses";

describe("project responses", () => {
  const project = {
    projectId: "21d5cbe4-21fb-44be-8b3c-e65f99b721f5",
    name: "Fabra",
    directory: "/tmp/fabra",
    active: true,
  };

  it("maps domain primitives to the project HTTP contract", () => {
    expect(toProjectResponse(project)).toEqual({
      id: project.projectId,
      name: "Fabra",
      root: "/tmp/fabra",
      active: true,
    });
  });

  it("derives the active id for project registry responses", () => {
    expect(toProjectRegistryResponse([project])).toEqual({
      version: 1,
      activeProjectId: project.projectId,
      projects: [toProjectResponse(project)],
    });
  });
});
