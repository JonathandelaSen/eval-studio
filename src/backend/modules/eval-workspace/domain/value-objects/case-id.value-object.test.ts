import { describe, expect, it } from "vitest";
import { CaseId } from "./case-id.value-object";

describe("CaseId", () => {
  it("round-trips a valid UUID", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(CaseId.fromPrimitives(uuid).toPrimitives()).toBe(uuid);
  });
});
