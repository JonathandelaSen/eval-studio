import { describe, expect, it } from "vitest";
import { shouldLoadWorkspaceFiles } from "./loading-state";

describe("shouldLoadWorkspaceFiles", () => {
  it("loads once when the view first becomes active", () => {
    expect(
      shouldLoadWorkspaceFiles({ active: true, loaded: false, loading: false }),
    ).toBe(true);
  });

  it("does not reload forever after an empty directory was loaded", () => {
    expect(
      shouldLoadWorkspaceFiles({ active: true, loaded: true, loading: false }),
    ).toBe(false);
  });
});
