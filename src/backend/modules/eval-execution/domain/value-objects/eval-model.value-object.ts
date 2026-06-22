import { ValueObject } from "@/backend/modules/shared";

class EvalModelError extends Error {
  constructor() {
    super("Model cannot be empty.");
    this.name = "EvalModelError";
  }
}

export class EvalModel extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new EvalModelError();
    }
    this.value = trimmed;
  }

  static fromPrimitives(value: string): EvalModel {
    return new EvalModel(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
