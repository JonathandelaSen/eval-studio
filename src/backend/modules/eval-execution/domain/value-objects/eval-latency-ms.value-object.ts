import { ValueObject } from "@/backend/modules/shared";

class EvalLatencyMsError extends Error {
  constructor() {
    super("Latency cannot be negative.");
    this.name = "EvalLatencyMsError";
  }
}

const MIN_LATENCY = 0;

export class EvalLatencyMs extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
    if (!Number.isFinite(value) || value < MIN_LATENCY) {
      throw new EvalLatencyMsError();
    }
  }

  static fromPrimitives(value: number): EvalLatencyMs {
    return new EvalLatencyMs(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
