import { describe, expect, it } from "vitest";
import { EvalSuites } from "./eval-suites.value-object";

describe("EvalSuites", () => {
  it("round-trips empty suites array", () => {
    expect(EvalSuites.fromPrimitives([]).toPrimitives()).toEqual([]);
  });

  it("round-trips suite values", () => {
    const suites = [
      {
        suiteId: "s1",
        actionId: "a1",
        name: "Suite 1",
        caseIds: ["c1", "c2"],
      },
    ];
    expect(EvalSuites.fromPrimitives(suites).toPrimitives()).toEqual(suites);
  });
});
