import { describe, expect, it } from "vitest";
import { parseWorkspaceRequest } from "./validation";

describe("parseWorkspaceRequest", () => {
  it("returns an empty input for the workspace read", () => {
    expect(parseWorkspaceRequest()).toEqual({ ok: true, value: {} });
  });
});
