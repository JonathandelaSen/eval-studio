import { ValueObject } from "@/backend/modules/shared";
import { EvalResultErrorMessage } from "./eval-result-error-message.value-object";
import {
  EvalResultErrorCode,
  EVAL_RESULT_ERROR_CODES,
} from "./eval-result-error-code.value-object";
import type { EvalResultErrorCodeValue } from "./eval-result-error-code.value-object";

export interface EvalResultErrorAttributes {
  message: string;
  code?: EvalResultErrorCodeValue;
}

export type EvalResultErrorValue = EvalResultErrorAttributes | null;

const DEFAULT_PROVIDER_ERROR_MESSAGE = "Provider request failed.";
const EMPTY_MESSAGE = "";

export class EvalResultError extends ValueObject<EvalResultErrorValue> {
  private constructor(
    private readonly message: EvalResultErrorMessage,
    private readonly code: EvalResultErrorCode,
  ) {
    super();
  }

  static fromPrimitives(value: EvalResultErrorValue): EvalResultError {
    if (!value) {
      return EvalResultError.none();
    }
    return new EvalResultError(
      EvalResultErrorMessage.fromPrimitives(value.message),
      EvalResultErrorCode.fromPrimitives(value.code ?? EVAL_RESULT_ERROR_CODES.provider),
    );
  }

  static providerError(message?: string): EvalResultError {
    return new EvalResultError(
      EvalResultErrorMessage.fromPrimitives(message ?? DEFAULT_PROVIDER_ERROR_MESSAGE),
      EvalResultErrorCode.provider(),
    );
  }

  static none(): EvalResultError {
    return new EvalResultError(
      EvalResultErrorMessage.fromPrimitives(EMPTY_MESSAGE),
      EvalResultErrorCode.none(),
    );
  }

  toPrimitives(): EvalResultErrorValue {
    if (this.code.isNone()) {
      return null;
    }
    return {
      message: this.message.toPrimitives(),
      code: this.code.toPrimitives(),
    };
  }
}
