import { describe, expect, it } from "vitest";
import { WorkspaceRoot } from "./workspace-root.value-object";

describe("WorkspaceRoot", () => {
  it("trims and round-trips roots", () => {
    expect(WorkspaceRoot.fromPrimitives(" /tmp/evals ").toPrimitives()).toBe(
      "/tmp/evals",
    );
  });

  it("rejects empty workspace roots", () => {
    expect(() => WorkspaceRoot.fromPrimitives(" ")).toThrow(
      "Workspace root cannot be empty.",
    );
  });
});
