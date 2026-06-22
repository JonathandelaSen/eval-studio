import { ValueObject } from "@/backend/modules/shared";

class ProducerError extends Error {
  constructor() {
    super("Producer cannot be empty.");
    this.name = "ProducerError";
  }
}

export class Producer extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new ProducerError();
    }
    this.value = trimmed;
  }

  static fromPrimitives(value: string): Producer {
    return new Producer(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
