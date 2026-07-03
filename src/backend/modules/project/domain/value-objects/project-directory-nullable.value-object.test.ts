import { describe, expect, it } from "vitest";
import { ProjectDirectoryNullable } from "./project-directory-nullable.value-object";

describe("ProjectDirectoryNullable", () => {
  it("round-trips a directory or null", () => {
    expect(ProjectDirectoryNullable.fromPrimitives(" /tmp ").toPrimitives()).toBe(
      "/tmp",
    );
    expect(ProjectDirectoryNullable.empty().toPrimitives()).toBeNull();
  });

  it("rejects blank directories", () => {
    expect(() => ProjectDirectoryNullable.fromPrimitives(" ")).toThrow();
  });
});
