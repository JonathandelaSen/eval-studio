import { ValueObject } from "@/backend/modules/shared";
const EMPTY_SUITE_NAME_MESSAGE = "Suite name cannot be empty.";
class SuiteNameError extends Error { constructor() { super(EMPTY_SUITE_NAME_MESSAGE); this.name = "SuiteNameError"; } }

export class SuiteName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new SuiteNameError();
  }
  static fromPrimitives(value: string): SuiteName { return new SuiteName(value.trim()); }
  toPrimitives(): string { return this.value; }
}
