export { AggregateRoot } from "./domain/entities/aggregate-root";
export { DomainError } from "./domain/errors/domain-error";
export { EntityId } from "./domain/value-objects/entity-id.value-object";
export { StringId } from "./domain/value-objects/string-id.value-object";
export { Timestamp } from "./domain/value-objects/timestamp.value-object";
export { ValueObject } from "./domain/value-objects/value-object";


// Event Bus
export type { DomainEvent } from "./domain/bus/event-bus/domain-event";
export type { InfrastructureEvent } from "./domain/bus/event-bus/infrastructure-event";
export type { EventBus, EventHandler } from "./domain/bus/event-bus/event-bus";
export { InMemoryEventBus } from "./infrastructure/bus/event-bus/in-memory-event-bus";

// Telemetry
export type {
  Telemetry,
  TelemetryAttribute,
  TelemetryCaptureOptions,
  TelemetryLogLevel,
  TelemetryLogOptions,
  TelemetrySpanOptions,
  TelemetryUser,
} from "./application/telemetry/telemetry";
export { NoOpTelemetry } from "./infrastructure/telemetry/no-op-telemetry";


