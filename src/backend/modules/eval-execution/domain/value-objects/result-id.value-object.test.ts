import { describe, expect, it } from "vitest";
import { CaseId } from "./case-id.value-object";
import { EvalRunId } from "./eval-run-id.value-object";
import { ResultId } from "./result-id.value-object";

const CASE_ID = "11111111-1111-1111-1111-111111111111";

describe("ResultId", () => {
  it("creates a run scoped result id", () => {
    expect(
      ResultId.create({
        evalRunId: EvalRunId.fromPrimitives("run-1"),
        caseId: CaseId.fromPrimitives(CASE_ID),
      }).toPrimitives(),
    ).toBe(`run-1.${CASE_ID}`);
  });

  it("round-trips a non-empty id", () => {
    expect(ResultId.fromPrimitives("result-1").toPrimitives()).toBe("result-1");
  });
});
