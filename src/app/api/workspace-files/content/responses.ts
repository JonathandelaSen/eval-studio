import type { WorkspaceJsonFilePrimitives } from "@/backend/modules/eval-workspace";

export type WorkspaceFileContentResponse = WorkspaceJsonFilePrimitives;
export type SaveWorkspaceFileResponse = WorkspaceJsonFilePrimitives;

export function toWorkspaceFileContentResponse(
  file: WorkspaceJsonFilePrimitives,
): WorkspaceFileContentResponse {
  return { ...file };
}

export function toSaveWorkspaceFileResponse(
  file: WorkspaceJsonFilePrimitives,
): SaveWorkspaceFileResponse {
  return { ...file };
}
