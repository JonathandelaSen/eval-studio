import { describe, expect, it } from "vitest";
import { parseProjectId } from "./validation";

describe("parseProjectId", () => {
  it("accepts UUID and legacy project identities", () => {
    expect(parseProjectId("21d5cbe4-21fb-44be-8b3c-e65f99b721f5").ok).toBe(true);
    expect(parseProjectId("d91e7047294ace08").ok).toBe(true);
  });

  it("rejects malformed identities", () => {
    expect(parseProjectId("project-1")).toMatchObject({
      ok: false,
      error: { code: "invalid_project_id", status: 400 },
    });
  });
});
