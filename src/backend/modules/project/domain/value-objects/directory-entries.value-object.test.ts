import { describe, expect, it } from "vitest";
import { DirectoryEntries } from "./directory-entries.value-object";

describe("DirectoryEntries", () => {
  it("round-trips directory entries", () => {
    const primitives = [{ name: "evals", path: "/tmp/evals" }];
    expect(DirectoryEntries.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });
});
