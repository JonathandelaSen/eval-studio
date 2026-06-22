import { ValueObject } from "@/backend/modules/shared";

export class EvalRawOutput extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): EvalRawOutput {
    return new EvalRawOutput(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
