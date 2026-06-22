import { describe, expect, it } from "vitest";
import { EvalModel } from "./eval-model.value-object";

describe("EvalModel", () => {
  it("trims and round-trips model names", () => {
    expect(EvalModel.fromPrimitives(" gpt-5 mini ").toPrimitives()).toBe("gpt-5 mini");
  });

  it("throws when model is empty or only whitespace", () => {
    expect(() => EvalModel.fromPrimitives("   ")).toThrow("Model cannot be empty.");
  });
});
