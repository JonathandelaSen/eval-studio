import { EntityId } from "@/backend/modules/shared";

export class ResultId extends EntityId {
  private constructor(value: string) {
    super(value, "Result id");
  }

  static fromPrimitives(value: string): ResultId {
    return new ResultId(value);
  }
}
