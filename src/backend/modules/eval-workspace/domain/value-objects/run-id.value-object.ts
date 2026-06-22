import { EntityId } from "@/backend/modules/shared";

export class RunId extends EntityId {
  private constructor(value: string) {
    super(value, "Run id");
  }

  static fromPrimitives(value: string): RunId {
    return new RunId(value);
  }
}
