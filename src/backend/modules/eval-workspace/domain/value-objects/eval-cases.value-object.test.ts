import { describe, expect, it } from "vitest";
import { EvalCases } from "./eval-cases.value-object";

describe("EvalCases", () => {
  it("round-trips empty cases array", () => {
    expect(EvalCases.fromPrimitives([]).toPrimitives()).toEqual([]);
  });

  it("round-trips case values", () => {
    const cases = [
      {
        caseId: "c1",
        suiteId: "s1",
        name: "Case 1",
        createdAt: "2026-07-03T00:00:00Z",
        renderedPrompt: {
          format: "text",
        },
      },
    ];
    expect(EvalCases.fromPrimitives(cases).toPrimitives()).toEqual(cases);
  });
});
