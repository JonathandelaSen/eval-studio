import { EntityId } from "@/backend/modules/shared";

export class CaseId extends EntityId {
  private constructor(value: string) {
    super(value, "Case id");
  }

  static fromPrimitives(value: string): CaseId {
    return new CaseId(value);
  }
}
