import { ValueObject } from "@/backend/modules/shared";

export class EvalLatencyMs extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
  }

  static fromPrimitives(value: number): EvalLatencyMs {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Latency cannot be negative.");
    }
    return new EvalLatencyMs(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
