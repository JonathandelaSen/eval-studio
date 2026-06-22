import { describe, expectTypeOf, it } from "vitest";
import type { DomainEvent } from "./domain-event";

describe("DomainEvent", () => {
  it("carries event details", () => {
    class TestEvent implements DomainEvent {
      readonly eventName = "test.event";
      readonly occurredAt = new Date();
      toPrimitives(): Record<string, unknown> {
        return { ok: true };
      }
    }
    const event = new TestEvent();
    expectTypeOf(event.eventName).toEqualTypeOf<string>();
  });
});
