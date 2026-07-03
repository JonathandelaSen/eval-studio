import { ValueObject } from "@/backend/modules/shared";
import type { EvalResultPrimitives } from "@/backend/modules/eval-execution";

export class EvalResults extends ValueObject<unknown> {
  private constructor(private readonly value: EvalResultPrimitives[]) {
    super();
  }

  static fromPrimitives(value: EvalResultPrimitives[]): EvalResults {
    return new EvalResults(value);
  }

  toPrimitives(): EvalResultPrimitives[] {
    return this.value;
  }
}
