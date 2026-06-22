import { ValueObject } from "./value-object";

class TimestampError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimestampError";
  }
}

const EMPTY_ERROR_MESSAGE = "Timestamp cannot be empty.";
const INVALID_ISO_ERROR_MESSAGE = "Timestamp must be an ISO date.";

export class Timestamp extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) {
      throw new TimestampError(EMPTY_ERROR_MESSAGE);
    }
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      throw new TimestampError(INVALID_ISO_ERROR_MESSAGE);
    }
  }

  static fromPrimitives(value: string): Timestamp {
    return new Timestamp(value);
  }

  static now(): Timestamp {
    return new Timestamp(new Date().toISOString());
  }

  toPrimitives(): string {
    return this.value;
  }
}
