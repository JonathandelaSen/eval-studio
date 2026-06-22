import { describe, expect, it } from "vitest";
import { ActionId } from "./action-id.value-object";

describe("ActionId", () => {
  it("round-trips a valid UUID", () => {
    const uuid = "987f6543-e21b-32d1-b654-246614174111";
    expect(ActionId.fromPrimitives(uuid).toPrimitives()).toBe(uuid);
  });
});
