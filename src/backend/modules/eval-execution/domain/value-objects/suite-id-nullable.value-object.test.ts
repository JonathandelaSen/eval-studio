import { describe, expect, it } from "vitest";
import { SuiteId } from "./suite-id.value-object";
import { SuiteIdNullable } from "./suite-id-nullable.value-object";

describe("SuiteIdNullable", () => {
  it("can wrap an active SuiteId and serialize it", () => {
    const uuid = "223e4567-e89b-12d3-a456-426614174000";
    const inner = SuiteId.fromPrimitives(uuid);
    const nullable = SuiteIdNullable.fromValue(inner);

    expect(nullable.isNull).toBe(false);
    expect(nullable.valueValue).toBe(inner);
    expect(nullable.toPrimitives()).toBe(uuid);
  });

  it("can represent an empty/null SuiteId", () => {
    const nullable = SuiteIdNullable.empty();

    expect(nullable.isNull).toBe(true);
    expect(nullable.valueValue).toBeNull();
    expect(nullable.toPrimitives()).toBeNull();
  });

  it("can be created from null/undefined/empty primitives", () => {
    expect(SuiteIdNullable.fromPrimitives(null).isNull).toBe(true);
    expect(SuiteIdNullable.fromPrimitives(undefined).isNull).toBe(true);
    expect(SuiteIdNullable.fromPrimitives("   ").isNull).toBe(true);
  });

  it("can be created from valid primitives", () => {
    const uuid = "323e4567-e89b-12d3-a456-426614174000";
    const nullable = SuiteIdNullable.fromPrimitives(uuid);
    expect(nullable.isNull).toBe(false);
    expect(nullable.toPrimitives()).toBe(uuid);
  });
});
