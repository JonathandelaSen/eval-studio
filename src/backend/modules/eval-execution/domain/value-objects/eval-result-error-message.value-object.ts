import { ValueObject } from "@/backend/modules/shared";

export class EvalResultErrorMessage extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): EvalResultErrorMessage {
    return new EvalResultErrorMessage(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
