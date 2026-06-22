import { ValueObject } from "@/backend/modules/shared";

export class EvalRawOutputNullable extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): EvalRawOutputNullable {
    return new EvalRawOutputNullable(value ?? null);
  }

  static empty(): EvalRawOutputNullable {
    return new EvalRawOutputNullable(null);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
