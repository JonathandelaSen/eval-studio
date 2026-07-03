import { ValueObject } from "@/backend/modules/shared";

export class SuiteDescriptionNullable extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) { super(); }
  static fromPrimitives(value?: string | null): SuiteDescriptionNullable {
    return new SuiteDescriptionNullable(value?.trim() || null);
  }
  static empty(): SuiteDescriptionNullable { return new SuiteDescriptionNullable(null); }
  toPrimitives(): string | null { return this.value; }
}
