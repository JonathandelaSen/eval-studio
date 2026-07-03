import type { ListWorkspaceFilesResponse } from "@/app/api/workspace-files/responses";
import type {
  SaveWorkspaceFileResponse,
  WorkspaceFileContentResponse,
} from "@/app/api/workspace-files/content/responses";
import { readJsonResponse } from "@/frontend/api/read-json-response";

const jsonHeaders = { "Content-Type": "application/json" };

export async function listWorkspaceFiles(): Promise<ListWorkspaceFilesResponse> {
  return readJsonResponse<ListWorkspaceFilesResponse>(
    await fetch("/api/workspace-files"),
  );
}

export async function getWorkspaceFile(
  path: string,
): Promise<WorkspaceFileContentResponse> {
  const query = new URLSearchParams({ path });
  return readJsonResponse<WorkspaceFileContentResponse>(
    await fetch(`/api/workspace-files/content?${query}`),
  );
}

export async function saveWorkspaceFile(
  path: string,
  content: string,
): Promise<SaveWorkspaceFileResponse> {
  return readJsonResponse<SaveWorkspaceFileResponse>(
    await fetch("/api/workspace-files/content", {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ path, content }),
    }),
  );
}
