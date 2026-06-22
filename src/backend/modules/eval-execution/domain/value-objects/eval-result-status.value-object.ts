import { ValueObject } from "@/backend/modules/shared";

export const EVAL_RESULT_STATUSES = ["completed", "failed"] as const;
export type EvalResultStatusValue = (typeof EVAL_RESULT_STATUSES)[number];

const COMPLETED_STATUS = EVAL_RESULT_STATUSES[0];
const FAILED_STATUS = EVAL_RESULT_STATUSES[1];

class EvalResultStatusError extends Error {
  constructor(value: string) {
    super(`Unknown eval result status: ${value}`);
    this.name = "EvalResultStatusError";
  }
}

export class EvalResultStatus extends ValueObject<EvalResultStatusValue> {
  private readonly value: EvalResultStatusValue;

  private constructor(value: string) {
    super();
    const matched = EVAL_RESULT_STATUSES.find((status) => status === value);
    if (!matched) {
      throw new EvalResultStatusError(value);
    }
    this.value = matched;
  }

  static fromPrimitives(value: string): EvalResultStatus {
    return new EvalResultStatus(value);
  }

  static completed(): EvalResultStatus {
    return new EvalResultStatus(COMPLETED_STATUS);
  }

  static failed(): EvalResultStatus {
    return new EvalResultStatus(FAILED_STATUS);
  }

  isCompleted(): boolean {
    return this.value === COMPLETED_STATUS;
  }

  isFailed(): boolean {
    return this.value === FAILED_STATUS;
  }

  toPrimitives(): EvalResultStatusValue {
    return this.value;
  }
}
