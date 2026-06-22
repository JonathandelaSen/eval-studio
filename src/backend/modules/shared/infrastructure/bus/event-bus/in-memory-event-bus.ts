import type { DomainEvent } from "../../../domain/bus/event-bus/domain-event";
import type {
  EventBus,
  EventHandler,
} from "../../../domain/bus/event-bus/event-bus";
import type { Telemetry } from "../../../application/telemetry/telemetry";

export class InMemoryEventBus implements EventBus {
  private publishedEvents: DomainEvent[] = [];
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(private readonly telemetry: Telemetry) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      let published = false;
      const publishOnce = async () => {
        if (published) return;
        published = true;
        this.publishedEvents.push(event);
        for (const handler of this.handlers.get(event.eventName) ?? []) {
          await handler.handle(event);
        }

        try {
          this.telemetry.log({
            level: "info",
            message: "Domain event published",
            attributes: {
              "eval_studio.layer": "domain",
              "eval_studio.domain_event": event.eventName,
              "eval_studio.occurred_at": event.occurredAt.toISOString(),
            },
          });
        } catch {
          // Telemetry is best effort and must never alter event publication.
        }
      };

      try {
        await this.telemetry.trace(
          {
            name: `event_bus.publish ${event.eventName}`,
            operation: "event_bus.publish",
            attributes: {
              "eval_studio.layer": "domain",
              "eval_studio.domain_event": event.eventName,
            },
          },
          publishOnce,
        );
      } catch {
        await publishOnce();
      }
    }
  }

  subscribe<TEvent extends DomainEvent>(
    eventName: string,
    handler: EventHandler<TEvent>,
  ): void {
    const handlers = this.handlers.get(eventName) ?? [];
    handlers.push(handler as EventHandler);
    this.handlers.set(eventName, handlers);
  }

  getEvents(): DomainEvent[] {
    return this.publishedEvents;
  }

  clear(): void {
    this.publishedEvents = [];
  }
}
