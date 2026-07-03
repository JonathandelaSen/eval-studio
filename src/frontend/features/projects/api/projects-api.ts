import type { DirectoryListingResponse } from "@/app/api/directories/responses";
import type {
  CreateProjectResponse,
} from "@/app/api/projects/responses";
import type {
  DeleteProjectResponse,
} from "@/app/api/projects/[projectId]/responses";
import type {
  SelectProjectResponse,
} from "@/app/api/projects/[projectId]/select/responses";
import { readJsonResponse } from "@/frontend/api/read-json-response";

export async function listDirectories(
  directory?: string,
): Promise<DirectoryListingResponse> {
  const query = directory ? `?path=${encodeURIComponent(directory)}` : "";
  return readJsonResponse<DirectoryListingResponse>(
    await fetch(`/api/directories${query}`),
  );
}

export async function addProject(
  directory: string,
): Promise<CreateProjectResponse> {
  return readJsonResponse<CreateProjectResponse>(
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directory }),
    }),
  );
}

export async function selectProject(
  projectId: string,
): Promise<SelectProjectResponse> {
  return readJsonResponse<SelectProjectResponse>(
    await fetch(`/api/projects/${encodeURIComponent(projectId)}/select`, {
      method: "POST",
    }),
  );
}

export async function removeProject(
  projectId: string,
): Promise<DeleteProjectResponse> {
  return readJsonResponse<DeleteProjectResponse>(
    await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "DELETE",
    }),
  );
}
