import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { evalWorkspaceModule } from "./container";

describe("container", () => {
  let root: string | undefined;

  afterEach(async () => {
    if (root) await rm(root, { recursive: true, force: true });
  });

  it("resolves workspace details when passed workspaceRoot", async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "eval-studio-context-"));
    const workspaceRoot = path.join(root, "evals");
    await mkdir(workspaceRoot);
    await writeFile(
      path.join(workspaceRoot, "manifest.json"),
      JSON.stringify({
        schemaVersion: "1",
        workspaceName: "Selected project",
        createdAt: "2026-07-03T00:00:00.000Z",
      }),
      "utf8",
    );

    const workspace = await evalWorkspaceModule.getEvalWorkspace.execute({
      workspaceRoot,
    });

    expect(workspace.toPrimitives()).toMatchObject({
      workspaceRoot,
      manifest: { workspaceName: "Selected project" },
    });
  });

  it("returns a readable empty workspace when no workspaceRoot is provided", async () => {
    const workspace = await evalWorkspaceModule.getEvalWorkspace.execute();

    expect(workspace.toPrimitives().diagnostics).toEqual([
      { path: "Settings", message: "No project is selected." },
    ]);
  });
});
