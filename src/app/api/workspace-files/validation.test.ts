import { describe, expect, it } from "vitest";
import { parseListWorkspaceFilesRequest } from "./validation";
import {
  parseReadWorkspaceFileRequest,
  parseSaveWorkspaceFileRequest,
} from "./content/validation";

describe("workspace file request validation", () => {
  it("accepts a list request without input", () => {
    expect(parseListWorkspaceFilesRequest()).toEqual({ ok: true, value: {} });
  });

  it("accepts a nested JSON path for reading", () => {
    expect(
      parseReadWorkspaceFileRequest(
        new URLSearchParams({ path: "runs/baseline/run.json" }),
      ),
    ).toEqual({
      ok: true,
      value: { path: "runs/baseline/run.json" },
    });
  });

  it.each(["", "../secret.json", "/tmp/secret.json", "README.md"])(
    "rejects unsafe read paths: %s",
    (path) => {
      expect(
        parseReadWorkspaceFileRequest(new URLSearchParams({ path })).ok,
      ).toBe(false);
    },
  );

  it("accepts raw JSON for saving", () => {
    expect(
      parseSaveWorkspaceFileRequest({
        path: "manifest.json",
        content: '{"schemaVersion":"1"}',
      }),
    ).toEqual({
      ok: true,
      value: {
        path: "manifest.json",
        content: '{"schemaVersion":"1"}',
      },
    });
  });

  it("rejects malformed save bodies", () => {
    expect(parseSaveWorkspaceFileRequest({ path: "manifest.json" }).ok).toBe(
      false,
    );
    expect(
      parseSaveWorkspaceFileRequest({ path: "notes.txt", content: "{}" }).ok,
    ).toBe(false);
  });
});
