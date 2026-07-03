import { describe, expect, it } from "vitest";
import { DirectoryListing } from "./directory-listing.value-object";

describe("DirectoryListing", () => {
  it("round-trips a directory listing", () => {
    const primitives = {
      current: "/tmp",
      parent: "/",
      directories: [{ name: "evals", path: "/tmp/evals" }],
    };

    expect(DirectoryListing.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("rejects entries without names or paths", () => {
    expect(() =>
      DirectoryListing.fromPrimitives({
        current: "/tmp",
        parent: "/",
        directories: [{ name: "", path: "/tmp/evals" }],
      }),
    ).toThrow();
  });
});
