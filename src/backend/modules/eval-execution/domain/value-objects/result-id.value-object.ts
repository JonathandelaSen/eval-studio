import { StringId } from "@/backend/modules/shared";
import type { CaseId } from "./case-id.value-object";
import type { EvalRunId } from "./eval-run-id.value-object";

const SEPARATOR = ".";
const SLUG_REGEX = /[^a-z0-9._-]+/g;
const SLUG_REPLACEMENT = "-";
const SLUG_START = 0;
const SLUG_MAX_LENGTH = 80;

export class ResultId extends StringId {
  private constructor(value: string) {
    super(value);
  }

  static create(input: { evalRunId: EvalRunId; caseId: CaseId }): ResultId {
    return new ResultId(input.evalRunId.toPrimitives() + SEPARATOR + ResultId.slug(input.caseId.toPrimitives()));
  }

  static fromPrimitives(value: string): ResultId {
    return new ResultId(value);
  }

  private static slug(value: string): string {
    return value.toLowerCase().replace(SLUG_REGEX, SLUG_REPLACEMENT).slice(SLUG_START, SLUG_MAX_LENGTH);
  }
}
