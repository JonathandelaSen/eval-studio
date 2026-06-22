import { EntityId } from "@/backend/modules/shared";

export class SuiteId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static fromPrimitives(value: string): SuiteId {
    return new SuiteId(value);
  }
}
