import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Project } from "../../domain/entities/project.entity";
import { FilesystemProjectRepository } from "./filesystem-project.repository";

describe("FilesystemProjectRepository", () => {
  let root: string;
  let settingsFile: string;
  let repository: FilesystemProjectRepository;

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "eval-studio-project-repo-"));
    settingsFile = path.join(root, "config", "projects.json");
    repository = new FilesystemProjectRepository(settingsFile);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("starts with no projects when the settings file does not exist", async () => {
    await expect(repository.findAll()).resolves.toEqual([]);
  });

  it("saves and reloads projects using the existing settings format", async () => {
    const project = buildProject({ active: true });

    await repository.save(project);

    const reloaded = await repository.findAll();
    expect(reloaded.map((item) => item.toPrimitives())).toEqual([
      project.toPrimitives(),
    ]);
    await expect(readFile(settingsFile, "utf8")).resolves.toContain(
      '"activeProjectId": "21d5cbe4-21fb-44be-8b3c-e65f99b721f5"',
    );
  });

  it("atomically replaces the collection and its active project", async () => {
    const first = buildProject();
    const second = buildProject({
      id: "a74af800-c64b-45f1-a728-a259687f16aa",
      name: "Second",
      directory: "/tmp/second",
      active: true,
    });

    await repository.replaceAll([first, second]);

    const reloaded = await repository.findAll();
    expect(reloaded.map((item) => item.toPrimitives())).toMatchObject([
      { projectId: first.id.toPrimitives(), active: false },
      { projectId: second.id.toPrimitives(), active: true },
    ]);
  });

  it("hydrates legacy deterministic ids", async () => {
    await mkdir(path.dirname(settingsFile), { recursive: true });
    await writeFile(
      settingsFile,
      JSON.stringify({
        version: 1,
        activeProjectId: "d91e7047294ace08",
        projects: [
          {
            id: "d91e7047294ace08",
            name: "Legacy",
            root: "/tmp/legacy",
          },
        ],
      }),
      "utf8",
    );

    const reloaded = await repository.findAll();
    expect(reloaded.map((item) => item.toPrimitives())).toMatchObject([
      {
        projectId: "d91e7047294ace08",
        directory: "/tmp/legacy",
        active: true,
      },
    ]);
  });

  function buildProject(
    input: {
      id?: string;
      name?: string;
      directory?: string;
      active?: boolean;
    } = {},
  ) {
    return Project.fromPrimitives({
      projectId: input.id ?? "21d5cbe4-21fb-44be-8b3c-e65f99b721f5",
      name: input.name ?? "Fabra",
      directory: input.directory ?? "/tmp/fabra",
      active: input.active ?? false,
    });
  }
});
