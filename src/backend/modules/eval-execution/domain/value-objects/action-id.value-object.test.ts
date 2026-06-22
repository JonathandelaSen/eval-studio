import { describe, expect, it } from "vitest";
import { ActionId } from "./action-id.value-object";

describe("ActionId", () => {
  it("round-trips a non-empty id", () => {
    expect(ActionId.fromPrimitives("action.score").toPrimitives()).toBe("action.score");
  });
});
