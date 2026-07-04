import { describe, expect, it } from "vitest";
import { retryCaseIds } from "./retry-case-ids";

describe("retryCaseIds", () => {
  it("retries only missing cases when a run was interrupted", () => {
    expect(
      retryCaseIds(["case-1", "case-2"], [{ caseId: "case-1" }]),
    ).toEqual(["case-2"]);
  });

  it("retries every original case when the run has no missing cases", () => {
    expect(
      retryCaseIds(
        ["case-1", "case-2"],
        [{ caseId: "case-1" }, { caseId: "case-2" }],
      ),
    ).toEqual(["case-1", "case-2"]);
  });
});
