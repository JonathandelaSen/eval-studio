import { describe, expect, it } from "vitest";
import { ProjectMetadata } from "./project-metadata.value-object";

describe("ProjectMetadata", () => {
  it("round-trips inspected project metadata", () => {
    const primitives = { name: "Fabra", directory: "/tmp/fabra/evals" };

    expect(ProjectMetadata.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("rejects incomplete metadata", () => {
    expect(() =>
      ProjectMetadata.fromPrimitives({ name: "", directory: "/tmp/evals" }),
    ).toThrow();
  });
});
