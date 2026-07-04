import { describe, expect, it } from "vitest";
import { caseIdsForNewRun } from "./new-run-selection";

describe("caseIdsForNewRun", () => {
  it("targets only the case selected in the runs view", () => {
    expect(caseIdsForNewRun("case-active")).toEqual(["case-active"]);
  });
});
