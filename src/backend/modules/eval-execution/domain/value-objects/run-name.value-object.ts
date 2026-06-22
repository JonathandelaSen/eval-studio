import { ValueObject } from "@/backend/modules/shared";

class RunNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunNameError";
  }
}

const EMPTY_RUN_NAME_MESSAGE = "Run name cannot be empty.";

export class RunName extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new RunNameError(EMPTY_RUN_NAME_MESSAGE);
    }
    this.value = trimmed;
  }

  static fromPrimitives(value: string): RunName {
    return new RunName(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
