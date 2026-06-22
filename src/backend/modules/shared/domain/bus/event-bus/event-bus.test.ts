import { describe, expectTypeOf, it } from "vitest";
import type { EventBus } from "./event-bus";

describe("EventBus", () => {
  it("defines publish contract", () => {
    const bus: EventBus = {
      async publish() {}
    };
    expectTypeOf(bus.publish).toBeFunction();
  });
});
