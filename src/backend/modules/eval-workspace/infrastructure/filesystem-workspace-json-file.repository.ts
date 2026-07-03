import { promises as fs } from "node:fs";
import path from "node:path";
import { WorkspaceJsonFileNotFoundError } from "../domain/errors/workspace-json-file-not-found.error";
import type { WorkspaceJsonFileRepository } from "../domain/repositories/workspace-json-file.repository";
import type { WorkspaceRoot } from "../domain/value-objects/workspace-root.value-object";
import { WorkspaceJsonFile } from "../domain/value-objects/workspace-json-file.value-object";
import { WorkspaceJsonFiles } from "../domain/value-objects/workspace-json-files.value-object";

export class FilesystemWorkspaceJsonFileRepository
  implements WorkspaceJsonFileRepository
{
  async list(workspaceRoot: WorkspaceRoot | undefined): Promise<WorkspaceJsonFiles> {
    const root = this.requiredRoot(workspaceRoot);
    const paths = await this.findJsonFiles(root, root).catch(() => []);
    return WorkspaceJsonFiles.fromPrimitives(paths.sort((a, b) => a.localeCompare(b)));
  }

  async get(
    workspaceRoot: WorkspaceRoot | undefined,
    file: WorkspaceJsonFile,
  ): Promise<WorkspaceJsonFile> {
    const target = await this.existingFile(workspaceRoot, file);
    const content = await fs.readFile(target, "utf8");
    return WorkspaceJsonFile.fromPrimitives({
      path: file.toPrimitives().path,
      content,
    });
  }

  async save(
    workspaceRoot: WorkspaceRoot | undefined,
    file: WorkspaceJsonFile,
  ): Promise<WorkspaceJsonFile> {
    const target = await this.existingFile(workspaceRoot, file);
    const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(temporary, file.toPrimitives().content, "utf8");
    await fs.rename(temporary, target);
    return file;
  }

  private async existingFile(
    workspaceRoot: WorkspaceRoot | undefined,
    file: WorkspaceJsonFile,
  ) {
    const root = this.requiredRoot(workspaceRoot);
    const target = this.safeJoin(root, file.toPrimitives().path);
    try {
      const stat = await fs.lstat(target);
      if (!stat.isFile()) throw new WorkspaceJsonFileNotFoundError();
      return target;
    } catch (error) {
      if (error instanceof WorkspaceJsonFileNotFoundError) throw error;
      throw new WorkspaceJsonFileNotFoundError();
    }
  }

  private async findJsonFiles(root: string, directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const child = path.join(directory, entry.name);
        if (entry.isDirectory()) return this.findJsonFiles(root, child);
        if (entry.isFile() && entry.name.endsWith(".json")) {
          return [path.relative(root, child).split(path.sep).join("/")];
        }
        return [];
      }),
    );
    return nested.flat();
  }

  private requiredRoot(workspaceRoot: WorkspaceRoot | undefined) {
    const value = workspaceRoot?.toPrimitives();
    if (!value) throw new Error("No project is selected.");
    return path.resolve(value);
  }

  private safeJoin(root: string, relativePath: string) {
    const target = path.resolve(root, relativePath);
    if (!target.startsWith(`${root}${path.sep}`)) {
      throw new WorkspaceJsonFileNotFoundError();
    }
    return target;
  }
}
