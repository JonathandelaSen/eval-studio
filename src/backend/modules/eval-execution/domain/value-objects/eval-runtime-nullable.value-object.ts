import { ValueObject } from "@/backend/modules/shared";
import { EvalRuntime, type EvalRuntimePrimitives } from "./eval-runtime.value-object";

export class EvalRuntimeNullable extends ValueObject<EvalRuntimePrimitives | null> {
  private constructor(private readonly value: EvalRuntime | null) {
    super();
  }

  static fromPrimitives(primitives: EvalRuntimePrimitives | null | undefined): EvalRuntimeNullable {
    if (primitives === undefined || primitives === null) {
      return new EvalRuntimeNullable(null);
    }
    return new EvalRuntimeNullable(EvalRuntime.fromPrimitives(primitives));
  }

  static fromValue(value: EvalRuntime | null): EvalRuntimeNullable {
    return new EvalRuntimeNullable(value);
  }

  static empty(): EvalRuntimeNullable {
    return new EvalRuntimeNullable(null);
  }

  toPrimitives(): EvalRuntimePrimitives | null {
    return this.value ? this.value.toPrimitives() : null;
  }

  get valueValue(): EvalRuntime | null {
    return this.value;
  }

  get isNull(): boolean {
    return this.value === null;
  }
}
