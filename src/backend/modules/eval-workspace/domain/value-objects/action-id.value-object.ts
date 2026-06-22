import { EntityId } from "@/backend/modules/shared";

export class ActionId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static fromPrimitives(value: string): ActionId {
    return new ActionId(value);
  }
}
