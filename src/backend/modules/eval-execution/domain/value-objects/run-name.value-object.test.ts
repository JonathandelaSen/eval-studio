import { describe, expect, it } from "vitest";
import { RunName } from "./run-name.value-object";

describe("RunName", () => {
  it("trims and round-trips run names", () => {
    expect(RunName.fromPrimitives("  Run 1  ").toPrimitives()).toBe("Run 1");
  });

  it("throws when run name is empty or only whitespace", () => {
    expect(() => RunName.fromPrimitives("   ")).toThrow("Run name cannot be empty.");
  });
});
