import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProjectRepository } from "../../domain/repositories/project.repository";
import { Project } from "../../domain/entities/project.entity";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { ProjectId } from "../../domain/value-objects/project-id.value-object";

interface ProjectRow {
  id: string;
  name: string;
  root: string;
}

interface SettingsRow {
  version: 1;
  activeProjectId: string | null;
  projects: ProjectRow[];
}

export class FilesystemProjectRepository implements ProjectRepository {
  private pendingWrite: Promise<unknown> = Promise.resolve();

  constructor(private readonly settingsFile: string) {}

  async findAll(): Promise<Project[]> {
    const settings = await this.readSettings();
    return settings.projects.map((project) =>
      Project.fromPrimitives({
        projectId: project.id,
        name: project.name,
        directory: project.root,
        active: project.id === settings.activeProjectId,
      }),
    );
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const projects = await this.findAll();
    return (
      projects.find((project) => project.id.equals(id)) ??
      null
    );
  }

  async findByDirectory(directory: ProjectDirectory): Promise<Project | null> {
    const target = directory.toPrimitives();
    const projects = await this.findAll();
    return (
      projects.find(
        (project) => project.toPrimitives().directory === target,
      ) ?? null
    );
  }

  async save(project: Project): Promise<Project> {
    await this.queueWrite(async () => {
      const projects = await this.findAll();
      const projectId = project.id.toPrimitives();
      const next = projects.filter((item) => item.id.toPrimitives() !== projectId);
      if (project.isActive()) {
        for (const item of next) item.deactivate();
      }
      next.push(project);
      await this.writeProjects(next);
    });
    return project;
  }

  async replaceAll(projects: Project[]): Promise<Project[]> {
    await this.queueWrite(() => this.writeProjects(projects));
    return projects;
  }

  private async readSettings(): Promise<SettingsRow> {
    try {
      const parsed = JSON.parse(
        await fs.readFile(this.settingsFile, "utf8"),
      ) as Partial<SettingsRow>;
      if (
        parsed.version !== 1 ||
        !Array.isArray(parsed.projects) ||
        !(typeof parsed.activeProjectId === "string" || parsed.activeProjectId === null)
      ) {
        throw new Error("Project settings are invalid.");
      }
      for (const project of parsed.projects) {
        if (
          !project ||
          typeof project.id !== "string" ||
          typeof project.name !== "string" ||
          typeof project.root !== "string"
        ) {
          throw new Error("Project settings are invalid.");
        }
      }
      return parsed as SettingsRow;
    } catch (error) {
      if (this.isMissingFile(error)) {
        return { version: 1, activeProjectId: null, projects: [] };
      }
      throw error;
    }
  }

  private async writeProjects(projects: Project[]) {
    const activeProjectId =
      projects.find((project) => project.isActive())?.id.toPrimitives() ?? null;
    const settings: SettingsRow = {
      version: 1,
      activeProjectId,
      projects: projects.map((project) => {
        const primitives = project.toPrimitives();
        return {
          id: primitives.projectId,
          name: primitives.name,
          root: primitives.directory,
        };
      }),
    };
    await fs.mkdir(path.dirname(this.settingsFile), { recursive: true });
    const temporaryFile = `${this.settingsFile}.${process.pid}.tmp`;
    await fs.writeFile(
      temporaryFile,
      `${JSON.stringify(settings, null, 2)}\n`,
      "utf8",
    );
    await fs.rename(temporaryFile, this.settingsFile);
  }

  private async queueWrite(operation: () => Promise<void>) {
    const queued = this.pendingWrite.then(operation);
    this.pendingWrite = queued.catch(() => undefined);
    await queued;
  }

  private isMissingFile(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && "code" in error && error.code === "ENOENT";
  }
}
