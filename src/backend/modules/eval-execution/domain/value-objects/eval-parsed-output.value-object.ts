import { ValueObject } from "@/backend/modules/shared";

export class EvalParsedOutput extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): EvalParsedOutput {
    return new EvalParsedOutput(value);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
