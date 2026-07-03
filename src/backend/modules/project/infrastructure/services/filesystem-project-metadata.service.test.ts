import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { FilesystemProjectMetadataService } from "./filesystem-project-metadata.service";

describe("FilesystemProjectMetadataService", () => {
  let root: string;
  let service: FilesystemProjectMetadataService;

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "eval-studio-metadata-"));
    service = new FilesystemProjectMetadataService();
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("reads the project name from its manifest", async () => {
    await writeFile(
      path.join(root, "manifest.json"),
      JSON.stringify({ workspaceName: "Fabra evaluations" }),
      "utf8",
    );

    const metadata = await service.inspect(ProjectDirectory.fromPrimitives(root));

    expect(metadata.toPrimitives()).toEqual({
      name: "Fabra evaluations",
      directory: root,
    });
  });

  it("uses the directory name when the manifest is absent", async () => {
    const nested = path.join(root, "plain-project");
    await mkdir(nested);

    const metadata = await service.inspect(ProjectDirectory.fromPrimitives(nested));

    expect(metadata.toPrimitives().name).toBe("plain-project");
  });

  it("rejects paths that are not readable directories", async () => {
    await expect(
      service.inspect(ProjectDirectory.fromPrimitives(path.join(root, "missing"))),
    ).rejects.toThrow("Choose a readable directory.");
  });
});
