import { describe, expect, it } from "vitest";
import { parseDirectoryRequest } from "./validation";

describe("parseDirectoryRequest", () => {
  it("accepts an absent path or a non-empty path", () => {
    expect(parseDirectoryRequest(null)).toEqual({ ok: true, value: {} });
    expect(parseDirectoryRequest(" /tmp ")).toEqual({
      ok: true,
      value: { directory: "/tmp" },
    });
  });

  it("rejects a blank path", () => {
    expect(parseDirectoryRequest(" ")).toMatchObject({
      ok: false,
      error: { code: "invalid_directory", status: 400 },
    });
  });
});
