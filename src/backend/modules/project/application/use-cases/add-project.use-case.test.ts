import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";
import { FilesystemProjectRepository } from "../../infrastructure/repositories/filesystem-project.repository";
import { FilesystemProjectMetadataService } from "../../infrastructure/services/filesystem-project-metadata.service";
import { AddProjectUseCase } from "./add-project.use-case";

describe("AddProjectUseCase", () => {
  let root: string;
  let repository: FilesystemProjectRepository;
  let eventBus: InMemoryEventBus;

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "eval-studio-add-project-"));
    repository = new FilesystemProjectRepository(path.join(root, "settings.json"));
    eventBus = new InMemoryEventBus(new NoOpTelemetry());
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("adds and activates the first project", async () => {
    await writeFile(
      path.join(root, "manifest.json"),
      JSON.stringify({ workspaceName: "Fabra evaluations" }),
      "utf8",
    );

    const project = await buildUseCase().execute({ directory: root });

    expect(project.toPrimitives()).toMatchObject({
      name: "Fabra evaluations",
      directory: root,
      active: true,
    });
    expect((await repository.findAll()).map((item) => item.toPrimitives())).toEqual([
      project.toPrimitives(),
    ]);
    expect(eventBus.getEvents().map((event) => event.eventName)).toEqual([
      "project_management.project_added.1",
    ]);
  });

  it("returns the existing project for a duplicate directory", async () => {
    const useCase = buildUseCase();
    const first = await useCase.execute({ directory: root });

    const duplicate = await useCase.execute({ directory: path.join(root, ".") });

    expect(duplicate.toPrimitives()).toEqual(first.toPrimitives());
    expect(await repository.findAll()).toHaveLength(1);
    expect(eventBus.getEvents()).toHaveLength(1);
  });

  function buildUseCase() {
    return new AddProjectUseCase({
      projectRepository: repository,
      projectMetadataService: new FilesystemProjectMetadataService(),
      eventBus,
    });
  }
});
