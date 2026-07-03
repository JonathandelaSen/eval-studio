import type { DomainEvent } from "@/backend/modules/shared";
import type { EvalRuntimePrimitives } from "../value-objects/eval-runtime.value-object";

export interface EvalRunCreatedEventPrimitives {
  runId: string;
  name: string;
  suiteId: string;
  producer: string;
  createdAt: string;
  caseIds: string[];
  runtime?: EvalRuntimePrimitives | null;
  notes?: string | null;
  status: string;
}

export class EvalRunCreatedEvent implements DomainEvent<EvalRunCreatedEventPrimitives> {
  readonly eventName = "eval_execution.run_created.1";
  readonly occurredAt = new Date();

  constructor(private readonly attributes: EvalRunCreatedEventPrimitives) {}

  toPrimitives(): EvalRunCreatedEventPrimitives {
    return this.attributes;
  }
}
