import type { DomainEvent } from "./domain-event";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InfrastructureEvent<
  TPrimitives = Record<string, unknown>,
> extends DomainEvent<TPrimitives> {}
