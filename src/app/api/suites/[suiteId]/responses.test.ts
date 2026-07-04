import { describe, expect, it } from "vitest";
import { toDeleteSuiteResponse } from "./responses";

describe("toDeleteSuiteResponse", () => {
  it("serializes the deleted suite identifier", () => {
    expect(toDeleteSuiteResponse("support.refunds")).toEqual({
      suiteId: "support.refunds",
    });
  });
});
