import type { DomainEvent } from "@/backend/modules/shared";
import type { EvalResultPrimitives } from "../entities/eval-result.entity";

export type EvalResultFailedEventPrimitives = EvalResultPrimitives;

export class EvalResultFailedEvent implements DomainEvent<EvalResultFailedEventPrimitives> {
  readonly eventName = "eval_execution.result_failed.1";
  readonly occurredAt = new Date();

  constructor(private readonly attributes: EvalResultFailedEventPrimitives) {}

  toPrimitives(): EvalResultFailedEventPrimitives {
    return this.attributes;
  }
}
