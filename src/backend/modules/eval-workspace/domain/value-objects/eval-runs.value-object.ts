import { ValueObject } from "@/backend/modules/shared";
import type { EvalRunPrimitives } from "@/backend/modules/eval-execution";

export class EvalRuns extends ValueObject<unknown> {
  private constructor(private readonly value: EvalRunPrimitives[]) {
    super();
  }

  static fromPrimitives(value: EvalRunPrimitives[]): EvalRuns {
    return new EvalRuns(value);
  }

  toPrimitives(): EvalRunPrimitives[] {
    return this.value;
  }
}
