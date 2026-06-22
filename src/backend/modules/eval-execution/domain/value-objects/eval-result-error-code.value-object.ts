import { ValueObject } from "@/backend/modules/shared";

export const EVAL_RESULT_ERROR_CODES = {
  none: "none",
  provider: "provider_error",
} as const;

export type EvalResultErrorCodeValue =
  (typeof EVAL_RESULT_ERROR_CODES)[keyof typeof EVAL_RESULT_ERROR_CODES];

class EvalResultErrorCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvalResultErrorCodeError";
  }
}

const INVALID_CODE_MESSAGE_PREFIX = "Invalid eval result error code: ";

export class EvalResultErrorCode extends ValueObject<EvalResultErrorCodeValue> {
  private readonly value: EvalResultErrorCodeValue;

  private constructor(value: EvalResultErrorCodeValue) {
    super();
    const matched = Object.values(EVAL_RESULT_ERROR_CODES).find(
      (candidate) => candidate === value,
    );
    if (!matched) {
      throw new EvalResultErrorCodeError(INVALID_CODE_MESSAGE_PREFIX + value);
    }
    this.value = matched;
  }

  static fromPrimitives(value: EvalResultErrorCodeValue): EvalResultErrorCode {
    return new EvalResultErrorCode(value);
  }

  static none(): EvalResultErrorCode {
    return new EvalResultErrorCode(EVAL_RESULT_ERROR_CODES.none);
  }

  static provider(): EvalResultErrorCode {
    return new EvalResultErrorCode(EVAL_RESULT_ERROR_CODES.provider);
  }

  isNone(): boolean {
    return this.value === EVAL_RESULT_ERROR_CODES.none;
  }

  isProvider(): boolean {
    return this.value === EVAL_RESULT_ERROR_CODES.provider;
  }

  toPrimitives(): EvalResultErrorCodeValue {
    return this.value;
  }
}
