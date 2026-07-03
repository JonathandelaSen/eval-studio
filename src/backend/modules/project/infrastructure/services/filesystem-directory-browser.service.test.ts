import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { FilesystemDirectoryBrowserService } from "./filesystem-directory-browser.service";

describe("FilesystemDirectoryBrowserService", () => {
  let root: string | undefined;
  const service = new FilesystemDirectoryBrowserService();

  afterEach(async () => {
    if (root) await rm(root, { recursive: true, force: true });
  });

  it("returns only visible child directories in name order", async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "eval-studio-browser-"));
    await mkdir(path.join(root, "Zulu"));
    await mkdir(path.join(root, "alpha"));
    await mkdir(path.join(root, ".hidden"));
    await writeFile(path.join(root, "manifest.json"), "{}", "utf8");

    const listing = await service.browse(ProjectDirectory.fromPrimitives(root));

    expect(listing.toPrimitives()).toMatchObject({
      current: root,
      parent: path.dirname(root),
      directories: [
        { name: "alpha", path: path.join(root, "alpha") },
        { name: "Zulu", path: path.join(root, "Zulu") },
      ],
    });
  });

  it("rejects a path that is not a directory", async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "eval-studio-browser-"));
    const file = path.join(root, "file.txt");
    await writeFile(file, "hello", "utf8");

    await expect(
      service.browse(ProjectDirectory.fromPrimitives(file)),
    ).rejects.toThrow("Directory is not readable.");
  });
});
