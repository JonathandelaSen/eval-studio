import { describe, expect, it } from "vitest";
import { CaseId } from "./case-id.value-object";

describe("CaseId", () => {
  it("round-trips a non-empty id", () => {
    expect(CaseId.fromPrimitives("case-1").toPrimitives()).toBe("case-1");
  });
});
