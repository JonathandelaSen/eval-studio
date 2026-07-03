import { StringId } from "@/backend/modules/shared";

export class SuiteId extends StringId {
  private constructor(value: string) {
    super(value);
  }

  static fromPrimitives(value: string): SuiteId {
    return new SuiteId(value);
  }
}
