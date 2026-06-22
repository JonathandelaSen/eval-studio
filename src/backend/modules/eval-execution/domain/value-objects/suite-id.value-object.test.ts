import { describe, expect, it } from "vitest";
import { SuiteId } from "./suite-id.value-object";

describe("SuiteId", () => {
  it("creates a SuiteId and round-trips it", () => {
    const uuid = "423e4567-e89b-12d3-a456-426614174000";
    expect(SuiteId.fromPrimitives(uuid).toPrimitives()).toBe(uuid);
  });
});
