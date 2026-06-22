import { ValueObject } from "@/backend/modules/shared";
import { CaseId } from "./case-id.value-object";

class CaseIdsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaseIdsError";
  }
}

const EMPTY_CASE_IDS_MESSAGE = "Case IDs list cannot be empty.";
const ZERO = 0;

export class CaseIds extends ValueObject<string[]> {
  private constructor(private readonly values: CaseId[]) {
    super();
    if (values.length === ZERO) {
      throw new CaseIdsError(EMPTY_CASE_IDS_MESSAGE);
    }
  }

  static fromPrimitives(primitives: string[]): CaseIds {
    return new CaseIds(primitives.map(CaseId.fromPrimitives));
  }

  static fromCaseIds(values: CaseId[]): CaseIds {
    return new CaseIds(values);
  }

  get list(): CaseId[] {
    return this.values;
  }

  toPrimitives(): string[] {
    return this.values.map((caseId) => caseId.toPrimitives());
  }

  override equals(other: ValueObject<string[]>): boolean {
    if (!(other instanceof CaseIds)) {
      return false;
    }
    if (this.values.length !== other.values.length) {
      return false;
    }
    return this.values.every((val, index) => val.equals(other.values[index]));
  }
}
