import { ValueObject } from "@/backend/modules/shared";
import type { EvalResultPrimitives } from "@/backend/modules/eval-workspace";

export class EvalUsage extends ValueObject<EvalResultPrimitives["usage"]> {
  private constructor(private readonly value: EvalResultPrimitives["usage"]) {
    super();
  }

  static fromPrimitives(value: EvalResultPrimitives["usage"]): EvalUsage {
    return new EvalUsage(value);
  }

  toPrimitives(): EvalResultPrimitives["usage"] {
    return this.value;
  }
}
