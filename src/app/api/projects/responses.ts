import type { ProjectPrimitives } from "@/backend/modules/project";

export type ProjectResponse = {
  id: string;
  name: string;
  root: string;
  active: boolean;
};

export type ProjectRegistryResponse = {
  version: 1;
  activeProjectId: string | null;
  projects: ProjectResponse[];
};

export type CreateProjectResponse = ProjectResponse;
export type ListProjectsResponse = ProjectRegistryResponse;

export function toProjectResponse(project: ProjectPrimitives): ProjectResponse {
  return {
    id: project.projectId,
    name: project.name,
    root: project.directory,
    active: project.active,
  };
}

export function toProjectRegistryResponse(
  projects: ProjectPrimitives[],
): ProjectRegistryResponse {
  return {
    version: 1,
    activeProjectId:
      projects.find((project) => project.active)?.projectId ?? null,
    projects: projects.map(toProjectResponse),
  };
}
