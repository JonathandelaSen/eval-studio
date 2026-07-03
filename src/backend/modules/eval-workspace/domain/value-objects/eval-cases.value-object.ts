import { ValueObject } from "@/backend/modules/shared";
import type { EvalCasePrimitives } from "../entities/eval-workspace.entity";

export class EvalCases extends ValueObject<unknown> {
  private constructor(private readonly value: EvalCasePrimitives[]) {
    super();
  }

  static fromPrimitives(value: EvalCasePrimitives[]): EvalCases {
    return new EvalCases(value);
  }

  toPrimitives(): EvalCasePrimitives[] {
    return this.value;
  }
}
