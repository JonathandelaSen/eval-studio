import { ValueObject } from "./value-object";

export class Timestamp extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): Timestamp {
    if (!value.trim()) throw new Error("Timestamp cannot be empty.");
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) throw new Error("Timestamp must be an ISO date.");
    return new Timestamp(value);
  }

  static now(): Timestamp {
    return new Timestamp(new Date().toISOString());
  }

  toPrimitives(): string {
    return this.value;
  }
}
