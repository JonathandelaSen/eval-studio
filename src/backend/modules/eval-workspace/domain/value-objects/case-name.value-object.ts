import { ValueObject } from "@/backend/modules/shared";

class CaseNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaseNameError";
  }
}

const EMPTY_CASE_NAME_MESSAGE = "Case name cannot be empty.";

export class CaseName extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new CaseNameError(EMPTY_CASE_NAME_MESSAGE);
    }
    this.value = trimmed;
  }

  static fromPrimitives(value: string): CaseName {
    return new CaseName(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
