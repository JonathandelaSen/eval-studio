import { describe, expect, it } from "vitest";
import { EntityId } from "./entity-id.value-object";

describe("EntityId", () => {
  it("round-trips a valid UUID", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    expect(EntityId.fromPrimitives(uuid).toPrimitives()).toBe(uuid);
  });

  it("rejects empty ids", () => {
    expect(() => EntityId.fromPrimitives("")).toThrow();
  });

  it("rejects non-UUID ids", () => {
    expect(() => EntityId.fromPrimitives("not-a-uuid")).toThrow();
  });
});

