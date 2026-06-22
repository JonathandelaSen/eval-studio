import { EntityId } from "@/backend/modules/shared";

export class CaseId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static fromPrimitives(value: string): CaseId {
    return new CaseId(value);
  }
}
