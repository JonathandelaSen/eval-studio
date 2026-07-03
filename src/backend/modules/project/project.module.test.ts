import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";
import { createProjectModule } from "./project.module";

describe("createProjectModule", () => {
  let root: string | undefined;

  afterEach(async () => {
    if (root) await rm(root, { recursive: true, force: true });
  });

  it("exposes project use cases backed by the configured settings file", async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "eval-studio-project-module-"));
    const projectModule = createProjectModule({
      settingsFile: path.join(root, "projects.json"),
      homeDirectory: root,
      eventBus: new InMemoryEventBus(new NoOpTelemetry()),
    });

    const project = await projectModule.addProject.execute({ directory: root });

    await expect(projectModule.listProjects.execute()).resolves.toEqual([project]);
    await expect(projectModule.getActiveProject.execute()).resolves.toEqual(project);
  });
});
