import { promises as fs } from "node:fs";
import path from "node:path";
import { ProjectDirectoryUnreadableError } from "../../domain/errors/project-directory-unreadable.error";
import type { ProjectMetadataService } from "../../domain/services/project-metadata.service";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { ProjectMetadata } from "../../domain/value-objects/project-metadata.value-object";

export class FilesystemProjectMetadataService implements ProjectMetadataService {
  async inspect(directory: ProjectDirectory): Promise<ProjectMetadata> {
    const normalizedDirectory = path.resolve(directory.toPrimitives());
    try {
      const stats = await fs.stat(normalizedDirectory);
      if (!stats.isDirectory()) throw new Error();
      await fs.access(normalizedDirectory);
    } catch {
      throw new ProjectDirectoryUnreadableError();
    }

    return ProjectMetadata.fromPrimitives({
      name: await this.readName(normalizedDirectory),
      directory: normalizedDirectory,
    });
  }

  private async readName(directory: string) {
    try {
      const manifest = JSON.parse(
        await fs.readFile(path.join(directory, "manifest.json"), "utf8"),
      ) as { workspaceName?: unknown };
      if (typeof manifest.workspaceName === "string" && manifest.workspaceName.trim()) {
        return manifest.workspaceName.trim();
      }
    } catch {}
    return path.basename(directory) || directory;
  }
}
