import { describe, expect, it } from "vitest";
import { ProjectId } from "./project-id.value-object";

describe("ProjectId", () => {
  it("creates a UUID identity and round-trips persisted identities", () => {
    const created = ProjectId.create().toPrimitives();

    expect(created).toMatch(/^[0-9a-f-]{36}$/);
    expect(ProjectId.fromPrimitives(created).toPrimitives()).toBe(created);
  });

  it("rejects non-UUID identities", () => {
    expect(() => ProjectId.fromPrimitives("project-1")).toThrow();
  });

  it("accepts legacy deterministic identities from existing settings", () => {
    expect(ProjectId.fromPrimitives("d91e7047294ace08").toPrimitives()).toBe(
      "d91e7047294ace08",
    );
  });
});
