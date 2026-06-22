import { StringId } from "@/backend/modules/shared";
 
export class ResultId extends StringId {
  private constructor(value: string) {
    super(value);
  }
 
  static fromPrimitives(value: string): ResultId {
    return new ResultId(value);
  }
}
