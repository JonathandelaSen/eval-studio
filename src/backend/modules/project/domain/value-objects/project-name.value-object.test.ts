import { describe, expect, it } from "vitest";
import { ProjectName } from "./project-name.value-object";

describe("ProjectName", () => {
  it("trims and round-trips project names", () => {
    expect(ProjectName.fromPrimitives(" Fabra evaluations ").toPrimitives()).toBe(
      "Fabra evaluations",
    );
  });

  it("rejects empty names", () => {
    expect(() => ProjectName.fromPrimitives("  ")).toThrow("Project name cannot be empty.");
  });
});
