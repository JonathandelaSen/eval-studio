import { describe, expect, it } from "vitest";
import { parseCreateProjectRequest } from "./validation";

describe("parseCreateProjectRequest", () => {
  it("normalizes a project directory", () => {
    expect(parseCreateProjectRequest({ directory: " /tmp/fabra " })).toEqual({
      ok: true,
      value: { directory: "/tmp/fabra" },
    });
  });

  it("rejects missing directories", () => {
    expect(parseCreateProjectRequest({})).toMatchObject({
      ok: false,
      error: { code: "invalid_request", status: 400 },
    });
  });
});
