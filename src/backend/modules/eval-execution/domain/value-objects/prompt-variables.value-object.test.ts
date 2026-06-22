import { describe, expect, it } from "vitest";
import { PromptVariables } from "./prompt-variables.value-object";

describe("PromptVariables", () => {
  it("round-trips a variables record", () => {
    const variables = { topic: "weather", tone: "formal" };
    expect(PromptVariables.fromPrimitives(variables).toPrimitives()).toEqual(variables);
  });

  it("supports an empty (undefined) value", () => {
    expect(PromptVariables.empty().toPrimitives()).toBeUndefined();
  });
});
