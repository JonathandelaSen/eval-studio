export interface DomainEvent<TPrimitives = unknown> {
  readonly eventName: string;
  readonly occurredAt: Date;
  toPrimitives(): TPrimitives;
}
