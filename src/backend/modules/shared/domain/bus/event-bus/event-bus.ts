import type { DomainEvent } from "./domain-event";

export interface EventHandler<TEvent extends DomainEvent = DomainEvent> {
  handle(event: TEvent): Promise<void>;
}

export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
  subscribe?<TEvent extends DomainEvent>(
    eventName: string,
    handler: EventHandler<TEvent>,
  ): void;
}
