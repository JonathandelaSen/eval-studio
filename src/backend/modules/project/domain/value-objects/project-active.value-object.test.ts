import { describe, expect, it } from "vitest";
import { ProjectActive } from "./project-active.value-object";

describe("ProjectActive", () => {
  it("round-trips active state", () => {
    expect(ProjectActive.fromPrimitives(true).toPrimitives()).toBe(true);
    expect(ProjectActive.inactive().toPrimitives()).toBe(false);
  });
});
