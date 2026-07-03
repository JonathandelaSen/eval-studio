import { ValueObject } from "@/backend/modules/shared";
import { CaseId } from "./case-id.value-object";

export class CaseIds extends ValueObject<string[]> {
  private constructor(private readonly values: CaseId[]) { super(); }
  static fromPrimitives(values: string[]): CaseIds { return new CaseIds(values.map(CaseId.fromPrimitives)); }
  add(value: CaseId): CaseIds {
    return this.values.some((item) => item.toPrimitives() === value.toPrimitives())
      ? this
      : new CaseIds([...this.values, value]);
  }
  remove(value: CaseId): CaseIds { return new CaseIds(this.values.filter((item) => item.toPrimitives() !== value.toPrimitives())); }
  toPrimitives(): string[] { return this.values.map((item) => item.toPrimitives()); }
}
