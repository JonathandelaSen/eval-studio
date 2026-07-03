import { describe, expect, it } from "vitest";
import { formatDate } from "./workspace-format";

describe("formatDate", () => {
  it("formats artifact timestamps deterministically in UTC", () => {
    expect(formatDate("2026-07-03T12:23:00.000Z")).toBe("03 Jul 2026, 12:23 UTC");
  });
});
