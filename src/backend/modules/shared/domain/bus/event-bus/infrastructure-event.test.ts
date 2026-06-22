import { describe, expect, it } from "vitest";
import type { InfrastructureEvent } from "./infrastructure-event";

describe("InfrastructureEvent", () => {
  it("supports typed primitives", () => {
    class TestInfrastructureEvent
      implements InfrastructureEvent<{ interactionId: string }>
    {
      readonly eventName = "ai_runtime.prompt_prepared";
      readonly occurredAt = new Date("2026-06-13T10:00:00.000Z");

      toPrimitives() {
        return { interactionId: "interaction-1" };
      }
    }

    expect(new TestInfrastructureEvent().toPrimitives()).toEqual({
      interactionId: "interaction-1",
    });
  });
});
