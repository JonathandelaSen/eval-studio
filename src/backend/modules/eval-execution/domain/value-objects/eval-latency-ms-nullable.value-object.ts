import { ValueObject } from "@/backend/modules/shared";
import { EvalLatencyMs } from "./eval-latency-ms.value-object";

export class EvalLatencyMsNullable extends ValueObject<number | null> {
  private constructor(private readonly value: EvalLatencyMs | null) {
    super();
  }

  static fromPrimitives(value: number | null | undefined): EvalLatencyMsNullable {
    if (value === undefined || value === null) {
      return new EvalLatencyMsNullable(null);
    }
    return new EvalLatencyMsNullable(EvalLatencyMs.fromPrimitives(value));
  }

  static empty(): EvalLatencyMsNullable {
    return new EvalLatencyMsNullable(null);
  }

  toPrimitives(): number | null {
    return this.value ? this.value.toPrimitives() : null;
  }
}
