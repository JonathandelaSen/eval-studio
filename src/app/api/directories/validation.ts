import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

export type DirectoryRequest = { directory?: string };

export function parseDirectoryRequest(
  path: string | null,
):
  | { ok: true; value: DirectoryRequest }
  | { ok: false; error: ApiErrorDescriptor } {
  if (path === null) return { ok: true, value: {} };
  const directory = path.trim();
  if (directory) return { ok: true, value: { directory } };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_directory",
      message: "Choose a directory.",
    },
  };
}
