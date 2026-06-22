import { ValueObject } from "@/backend/modules/shared";

export class Producer extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): Producer {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Producer cannot be empty.");
    return new Producer(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
