import type { DirectoryListingPrimitives } from "@/backend/modules/project";

export type DirectoryListingResponse = DirectoryListingPrimitives;

export function toDirectoryListingResponse(
  listing: DirectoryListingPrimitives,
): DirectoryListingResponse {
  return {
    current: listing.current,
    parent: listing.parent,
    directories: listing.directories.map((directory) => ({ ...directory })),
  };
}
