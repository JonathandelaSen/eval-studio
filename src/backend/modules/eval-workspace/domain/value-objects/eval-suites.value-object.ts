import { ValueObject } from "@/backend/modules/shared";
import type { EvalSuitePrimitives } from "../entities/eval-workspace.entity";

export class EvalSuites extends ValueObject<unknown> {
  private constructor(private readonly value: EvalSuitePrimitives[]) {
    super();
  }

  static fromPrimitives(value: EvalSuitePrimitives[]): EvalSuites {
    return new EvalSuites(value);
  }

  toPrimitives(): EvalSuitePrimitives[] {
    return this.value;
  }
}
