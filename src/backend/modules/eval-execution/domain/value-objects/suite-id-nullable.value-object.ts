import { ValueObject } from "@/backend/modules/shared";
import { SuiteId } from "./suite-id.value-object";

const EMPTY_STRING = "";

export class SuiteIdNullable extends ValueObject<string | null> {
  private constructor(private readonly value: SuiteId | null) {
    super();
  }

  static fromPrimitives(value: string | null | undefined): SuiteIdNullable {
    if (value === undefined || value === null || value.trim() === EMPTY_STRING) {
      return new SuiteIdNullable(null);
    }
    return new SuiteIdNullable(SuiteId.fromPrimitives(value));
  }

  static fromValue(value: SuiteId | null): SuiteIdNullable {
    return new SuiteIdNullable(value);
  }

  static empty(): SuiteIdNullable {
    return new SuiteIdNullable(null);
  }

  toPrimitives(): string | null {
    return this.value ? this.value.toPrimitives() : null;
  }

  get valueValue(): SuiteId | null {
    return this.value;
  }

  get isNull(): boolean {
    return this.value === null;
  }
}
