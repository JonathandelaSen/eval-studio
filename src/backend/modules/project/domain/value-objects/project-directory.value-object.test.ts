import { describe, expect, it } from "vitest";
import { ProjectDirectory } from "./project-directory.value-object";

describe("ProjectDirectory", () => {
  it("trims and round-trips directories", () => {
    expect(ProjectDirectory.fromPrimitives(" /tmp/evals ").toPrimitives()).toBe(
      "/tmp/evals",
    );
  });

  it("rejects empty directories", () => {
    expect(() => ProjectDirectory.fromPrimitives(" ")).toThrow(
      "Project directory cannot be empty.",
    );
  });
});
