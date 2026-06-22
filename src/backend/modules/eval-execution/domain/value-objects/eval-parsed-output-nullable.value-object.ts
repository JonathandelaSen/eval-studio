import { ValueObject } from "@/backend/modules/shared";

/**
 * ============================================================================
 * TEMPORARY OPAQUE SHAPE — TO BE GIVEN A PROPER STRUCTURE LATER
 * ============================================================================
 * For now this Value Object stores the parsed provider output as an opaque
 * `unknown` blob. Later it will be given a concrete, typed structure with real
 * domain behaviour and validation.
 * ============================================================================
 */
export class EvalParsedOutputNullable extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): EvalParsedOutputNullable {
    return new EvalParsedOutputNullable(value ?? null);
  }

  static empty(): EvalParsedOutputNullable {
    return new EvalParsedOutputNullable(null);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
