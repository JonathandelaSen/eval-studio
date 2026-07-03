export interface ListWorkspaceFilesResponse {
  files: string[];
}

export function toListWorkspaceFilesResponse(
  files: string[],
): ListWorkspaceFilesResponse {
  return { files: [...files] };
}
