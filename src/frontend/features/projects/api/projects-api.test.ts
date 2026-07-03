import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addProject,
  listDirectories,
  removeProject,
  selectProject,
} from "./projects-api";

describe("projects API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requests a directory listing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ current: "/tmp", parent: "/", directories: [] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await listDirectories("/tmp");

    expect(fetchMock).toHaveBeenCalledWith("/api/directories?path=%2Ftmp");
  });

  it("adds a project using the API contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ id: "project-1", name: "Fabra", root: "/tmp", active: true }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await addProject("/tmp");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/projects",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ directory: "/tmp" }) }),
    );
  });

  it("uses dedicated resource routes to select and remove projects", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ id: "project-1", name: "Fabra", root: "/tmp", active: true }))
      .mockResolvedValueOnce(Response.json({ version: 1, activeProjectId: null, projects: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await selectProject("project-1");
    await removeProject("project-1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/projects/project-1/select",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/projects/project-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
