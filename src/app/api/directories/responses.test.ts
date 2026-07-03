import { describe, expect, it } from "vitest";
import { toDirectoryListingResponse } from "./responses";

describe("toDirectoryListingResponse", () => {
  it("maps a directory listing without changing its transport shape", () => {
    const listing = {
      current: "/tmp",
      parent: "/",
      directories: [{ name: "evals", path: "/tmp/evals" }],
    };

    expect(toDirectoryListingResponse(listing)).toEqual(listing);
  });
});
