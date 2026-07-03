import { ValueObject } from "@/backend/modules/shared";

export type EvalRuntimeMetadataPrimitives = { modelDigest?: string; systemVersion?: string } | null;

export class EvalRuntimeMetadataNullable extends ValueObject<unknown> {
  private constructor(private readonly value: EvalRuntimeMetadataPrimitives) { super(); }
  static fromPrimitives(value?: EvalRuntimeMetadataPrimitives): EvalRuntimeMetadataNullable {
    return new EvalRuntimeMetadataNullable(value && Object.keys(value).length ? { ...value } : null);
  }
  toPrimitives(): EvalRuntimeMetadataPrimitives { return this.value ? { ...this.value } : null; }
}
