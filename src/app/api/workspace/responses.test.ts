import { describe, expect, it } from "vitest";
import { toEvalWorkspaceResponse } from "./responses";

describe("toEvalWorkspaceResponse", () => {
  it("maps workspace primitives without changing their shape", () => {
    const workspace = {
      workspaceRoot: null,
      manifest: null,
      suites: [],
      cases: [],
      runs: [],
      results: [],
      annotations: [],
      diagnostics: [],
    };
    expect(toEvalWorkspaceResponse(workspace)).toEqual(workspace);
  });
});
