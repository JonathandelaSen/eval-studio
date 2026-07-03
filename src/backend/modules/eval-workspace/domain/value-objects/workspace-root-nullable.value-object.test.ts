import { describe, expect, it } from "vitest";
import { WorkspaceRootNullable } from "./workspace-root-nullable.value-object";

describe("WorkspaceRootNullable", () => {
  it("round-trips null values", () => {
    expect(WorkspaceRootNullable.fromPrimitives(null).toPrimitives()).toBeNull();
  });

  it("round-trips and validates non-null roots", () => {
    expect(
      WorkspaceRootNullable.fromPrimitives(" /tmp/evals ").toPrimitives(),
    ).toBe("/tmp/evals");
  });

  it("rejects empty workspace roots", () => {
    expect(() => WorkspaceRootNullable.fromPrimitives(" ")).toThrow(
      "Workspace root cannot be empty.",
    );
  });
});
