import { ValueObject } from "@/backend/modules/shared";

export const EVAL_RUN_STATUSES = ["queued", "running", "completed", "completed_with_failures", "interrupted"] as const;
export type EvalRunStatusPrimitives = (typeof EVAL_RUN_STATUSES)[number];
const QUEUED = EVAL_RUN_STATUSES[0];
const RUNNING = EVAL_RUN_STATUSES[1];
const COMPLETED = EVAL_RUN_STATUSES[2];
const COMPLETED_WITH_FAILURES = EVAL_RUN_STATUSES[3];
const INTERRUPTED = EVAL_RUN_STATUSES[4];
const INVALID_STATUS_MESSAGE = "Invalid run status.";
class EvalRunStatusError extends Error { constructor() { super(INVALID_STATUS_MESSAGE); this.name = "EvalRunStatusError"; } }

export class EvalRunStatus extends ValueObject<EvalRunStatusPrimitives> {
  private constructor(private readonly value: EvalRunStatusPrimitives) { super(); }
  static fromPrimitives(value: EvalRunStatusPrimitives): EvalRunStatus {
    if (!EVAL_RUN_STATUSES.includes(value)) throw new EvalRunStatusError();
    return new EvalRunStatus(value);
  }
  static queued(): EvalRunStatus { return new EvalRunStatus(QUEUED); }
  static running(): EvalRunStatus { return new EvalRunStatus(RUNNING); }
  static completed(hasFailures = false): EvalRunStatus { return new EvalRunStatus(hasFailures ? COMPLETED_WITH_FAILURES : COMPLETED); }
  static completedWithFailures(): EvalRunStatus { return new EvalRunStatus(COMPLETED_WITH_FAILURES); }
  static interrupted(): EvalRunStatus { return new EvalRunStatus(INTERRUPTED); }
  isQueued(): boolean { return this.value === QUEUED; }
  isRunning(): boolean { return this.value === RUNNING; }
  isCompleted(): boolean { return this.value === COMPLETED; }
  isCompletedWithFailures(): boolean { return this.value === COMPLETED_WITH_FAILURES; }
  isInterrupted(): boolean { return this.value === INTERRUPTED; }
  toPrimitives(): EvalRunStatusPrimitives { return this.value; }
}
