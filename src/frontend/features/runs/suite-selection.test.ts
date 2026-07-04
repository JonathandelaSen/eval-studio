import { describe, expect, it } from "vitest";
import { nextSuiteIdAfterDelete } from "./suite-selection";

describe("nextSuiteIdAfterDelete", () => {
  it("selects the first remaining suite", () => {
    expect(
      nextSuiteIdAfterDelete(
        [{ suiteId: "first" }, { suiteId: "second" }],
        "first",
      ),
    ).toBe("second");
  });

  it("clears the selection after deleting the last suite", () => {
    expect(nextSuiteIdAfterDelete([{ suiteId: "only" }], "only")).toBeNull();
  });
});
