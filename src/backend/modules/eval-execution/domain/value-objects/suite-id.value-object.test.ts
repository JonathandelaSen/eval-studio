import { describe, expect, it } from "vitest";
import { SuiteId } from "./suite-id.value-object";

describe("SuiteId", () => {
  it("round-trips a stable suite id", () => {
    const value = "glideboard.phrase-completion";
    expect(SuiteId.fromPrimitives(value).toPrimitives()).toBe(value);
  });
});
