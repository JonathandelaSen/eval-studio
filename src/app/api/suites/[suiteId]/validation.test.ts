import { describe, expect, it } from "vitest";
import { parseSuiteId } from "./validation";

describe("parseSuiteId", () => {
  it("accepts stable suite identifiers", () => {
    expect(parseSuiteId("support.refunds")).toEqual({
      ok: true,
      value: { suiteId: "support.refunds" },
    });
  });

  it("rejects blank suite identifiers", () => {
    expect(parseSuiteId("  ")).toMatchObject({
      ok: false,
      error: { status: 400, code: "invalid_suite_id" },
    });
  });

  it("rejects path separators", () => {
    expect(parseSuiteId("support/refunds")).toMatchObject({
      ok: false,
      error: { status: 400, code: "invalid_suite_id" },
    });
  });
});
