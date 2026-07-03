import { describe, expect, it } from "vitest";
import { DirectoryName } from "./directory-name.value-object";

describe("DirectoryName", () => {
  it("trims and round-trips directory names", () => {
    expect(DirectoryName.fromPrimitives(" evals ").toPrimitives()).toBe("evals");
  });

  it("rejects empty names", () => {
    expect(() => DirectoryName.fromPrimitives(" ")).toThrow();
  });
});
