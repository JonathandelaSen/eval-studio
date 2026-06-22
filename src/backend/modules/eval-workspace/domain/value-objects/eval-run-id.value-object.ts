import { StringId } from "@/backend/modules/shared";

export class EvalRunId extends StringId {
  private constructor(value: string) {
    super(value);
  }

  static fromPrimitives(value: string): EvalRunId {
    return new EvalRunId(value);
  }
}
