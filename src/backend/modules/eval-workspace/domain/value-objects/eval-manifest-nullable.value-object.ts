import { ValueObject } from "@/backend/modules/shared";
import type { EvalManifestPrimitives } from "../entities/eval-workspace.entity";

export class EvalManifestNullable extends ValueObject<unknown> {
  private constructor(private readonly value: EvalManifestPrimitives | null) {
    super();
  }

  static fromPrimitives(value: EvalManifestPrimitives | null): EvalManifestNullable {
    return new EvalManifestNullable(value);
  }

  toPrimitives(): EvalManifestPrimitives | null {
    return this.value;
  }
}
