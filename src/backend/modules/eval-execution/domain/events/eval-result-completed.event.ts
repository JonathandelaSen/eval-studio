import type { DomainEvent } from "@/backend/modules/shared";
import type { EvalResultPrimitives } from "../entities/eval-result.entity";

export type EvalResultCompletedEventPrimitives = EvalResultPrimitives;

export class EvalResultCompletedEvent implements DomainEvent<EvalResultCompletedEventPrimitives> {
  readonly eventName = "eval_execution.result_completed.1";
  readonly occurredAt = new Date();

  constructor(private readonly attributes: EvalResultCompletedEventPrimitives) {}

  toPrimitives(): EvalResultCompletedEventPrimitives {
    return this.attributes;
  }
}
