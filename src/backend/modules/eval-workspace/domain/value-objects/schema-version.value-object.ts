import { ValueObject } from "@/backend/modules/shared";
const CURRENT_SCHEMA_VERSION = "1";

export class SchemaVersion extends ValueObject<string> {
  private constructor(private readonly value: string) { super(); }
  static current(): SchemaVersion { return new SchemaVersion(CURRENT_SCHEMA_VERSION); }
  static fromPrimitives(value?: string): SchemaVersion { return new SchemaVersion(value ?? CURRENT_SCHEMA_VERSION); }
  toPrimitives(): string { return this.value; }
}
