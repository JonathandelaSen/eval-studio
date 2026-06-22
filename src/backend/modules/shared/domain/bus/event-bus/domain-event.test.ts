import { describe, expect, it } from "vitest";
import type { DomainEvent } from "./domain-event";

describe("DomainEvent", () => {
  it("defines the event contract", () => {
    const event: DomainEvent = {
      eventName: "test.event",
      occurredAt: "2026-06-22T00:00:00.000Z",
    };

    expect(event.eventName).toBe("test.event");
  });
});
