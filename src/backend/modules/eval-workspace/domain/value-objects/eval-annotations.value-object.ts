import { ValueObject } from "@/backend/modules/shared";
import type { EvalAnnotationPrimitives } from "../entities/eval-annotation.entity";

export class EvalAnnotations extends ValueObject<unknown> {
  private constructor(private readonly value: EvalAnnotationPrimitives[]) {
    super();
  }

  static fromPrimitives(value: EvalAnnotationPrimitives[]): EvalAnnotations {
    return new EvalAnnotations(value);
  }

  toPrimitives(): EvalAnnotationPrimitives[] {
    return this.value;
  }
}
