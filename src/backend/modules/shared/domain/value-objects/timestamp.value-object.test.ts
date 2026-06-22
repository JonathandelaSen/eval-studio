import { describe, expect, it } from "vitest";
import { Timestamp } from "./timestamp.value-object";

describe("Timestamp", () => {
  it("round-trips an ISO timestamp", () => {
    const value = "2026-06-22T00:00:00.000Z";
    expect(Timestamp.fromPrimitives(value).toPrimitives()).toBe(value);
  });

  it("rejects invalid timestamps", () => {
    expect(() => Timestamp.fromPrimitives("not-a-date")).toThrow();
  });
});
