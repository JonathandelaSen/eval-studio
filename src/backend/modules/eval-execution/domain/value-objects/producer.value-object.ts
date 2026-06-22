import { ValueObject } from "@/backend/modules/shared";

export const PRODUCERS = {
  evalStudio: "eval-studio",
} as const;

class ProducerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProducerError";
  }
}

const EMPTY_PRODUCER_MESSAGE = "Producer cannot be empty.";
const INVALID_PRODUCER_MESSAGE_PREFIX = "Invalid producer: ";

export class Producer extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new ProducerError(EMPTY_PRODUCER_MESSAGE);
    }
    const matched = Object.values(PRODUCERS).find((p) => p === trimmed);
    if (!matched) {
      throw new ProducerError(INVALID_PRODUCER_MESSAGE_PREFIX + value);
    }
    this.value = matched;
  }

  static fromPrimitives(value: string): Producer {
    return new Producer(value);
  }

  static evalStudio(): Producer {
    return new Producer(PRODUCERS.evalStudio);
  }

  isEvalStudio(): boolean {
    return this.value === PRODUCERS.evalStudio;
  }

  toPrimitives(): string {
    return this.value;
  }
}
