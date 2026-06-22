import { describe, expect, it, vi } from "vitest";
import { InMemoryEventBus } from "./in-memory-event-bus";
import type { DomainEvent } from "../../../domain/bus/event-bus/domain-event";
import type {
  Telemetry,
  TelemetryLogOptions,
  TelemetrySpanOptions,
} from "../../../application/telemetry/telemetry";

class DummyEvent implements DomainEvent {
  readonly eventName = "dummy.event";
  readonly occurredAt = new Date("2026-06-10T12:00:00.000Z");
  toPrimitives(): Record<string, unknown> {
    return { data: "test" };
  }
}

class FakeTelemetry implements Telemetry {
  readonly traces: TelemetrySpanOptions[] = [];
  readonly logs: TelemetryLogOptions[] = [];

  async trace<T>(
    options: TelemetrySpanOptions,
    operation: () => Promise<T>,
  ): Promise<T> {
    this.traces.push(options);
    return operation();
  }

  log(options: TelemetryLogOptions): void {
    this.logs.push(options);
  }

  captureException(): void {}
  setUser(): void {}
}

describe("InMemoryEventBus", () => {
  it("delivers published events to subscribed handlers", async () => {
    const telemetry = new FakeTelemetry();
    const bus = new InMemoryEventBus(telemetry);
    const handle = vi.fn().mockResolvedValue(undefined);
    const event = new DummyEvent();

    bus.subscribe(event.eventName, { handle });
    await bus.publish([event]);

    expect(handle).toHaveBeenCalledWith(event);
  });

  it("tracks published events with semantic spans and structured logs", async () => {
    const telemetry = new FakeTelemetry();
    const bus = new InMemoryEventBus(telemetry);
    const event = new DummyEvent();
    const toPrimitives = vi.spyOn(event, "toPrimitives");

    await bus.publish([event]);

    expect(bus.getEvents()).toEqual([event]);
    expect(telemetry.traces).toEqual([
      {
        name: "event_bus.publish dummy.event",
        operation: "event_bus.publish",
        attributes: {
          "eval_studio.layer": "domain",
          "eval_studio.domain_event": "dummy.event",
        },
      },
    ]);
    expect(telemetry.logs).toEqual([
      {
        level: "info",
        message: "Domain event published",
        attributes: {
          "eval_studio.layer": "domain",
          "eval_studio.domain_event": "dummy.event",
          "eval_studio.occurred_at": "2026-06-10T12:00:00.000Z",
        },
      },
    ]);
    expect(toPrimitives).not.toHaveBeenCalled();

    bus.clear();
    expect(bus.getEvents()).toEqual([]);
  });

  it("publishes events when telemetry fails", async () => {
    const telemetry = new FakeTelemetry();
    telemetry.trace = async () => {
      throw new Error("telemetry failed");
    };
    telemetry.log = () => {
      throw new Error("telemetry failed");
    };
    const bus = new InMemoryEventBus(telemetry);
    const event = new DummyEvent();

    await expect(bus.publish([event])).resolves.toBeUndefined();
    expect(bus.getEvents()).toEqual([event]);
  });
});
