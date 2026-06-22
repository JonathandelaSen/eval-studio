import { ValueObject } from "@/backend/modules/shared";

/**
 * ============================================================================
 * TEMPORARY OPAQUE SHAPE — TO BE GIVEN A PROPER STRUCTURE LATER
 * ============================================================================
 * For now this Value Object stores the provider usage payload as an opaque
 * `unknown` blob, because each provider returns a different usage shape.
 * Later it will be given a concrete, typed structure (e.g. input/output/total
 * tokens, cost, etc.) with real domain behaviour and validation.
 * ============================================================================
 */
export class EvalUsageNullable extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): EvalUsageNullable {
    return new EvalUsageNullable(value ?? null);
  }

  static empty(): EvalUsageNullable {
    return new EvalUsageNullable(null);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
