import { promises as fs } from "node:fs";
import path from "node:path";
import { ProjectDirectoryUnreadableError } from "../../domain/errors/project-directory-unreadable.error";
import type { DirectoryBrowserService } from "../../domain/services/directory-browser.service";
import { DirectoryListing } from "../../domain/value-objects/directory-listing.value-object";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";

export class FilesystemDirectoryBrowserService implements DirectoryBrowserService {
  async browse(directory: ProjectDirectory): Promise<DirectoryListing> {
    const current = path.resolve(directory.toPrimitives());
    try {
      const stats = await fs.stat(current);
      if (!stats.isDirectory()) throw new Error();
      const entries = await fs.readdir(current, { withFileTypes: true });
      const directories = entries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .map((entry) => ({ name: entry.name, path: path.join(current, entry.name) }))
        .sort((left, right) =>
          left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
        );
      const parent = path.dirname(current);
      return DirectoryListing.fromPrimitives({
        current,
        parent: parent === current ? null : parent,
        directories,
      });
    } catch {
      throw new ProjectDirectoryUnreadableError("Directory is not readable.");
    }
  }
}
