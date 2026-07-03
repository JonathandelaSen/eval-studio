import { describe, expect, it } from "vitest";
import { DirectoryEntry } from "./directory-entry.value-object";

describe("DirectoryEntry", () => {
  it("round-trips a directory entry", () => {
    const primitives = { name: "evals", path: "/tmp/evals" };
    expect(DirectoryEntry.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("rejects incomplete entries", () => {
    expect(() =>
      DirectoryEntry.fromPrimitives({ name: "", path: "/tmp/evals" }),
    ).toThrow();
  });
});
