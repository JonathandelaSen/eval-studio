import { describe, expect, it } from "vitest";
import { EvalRawOutputNullable } from "./eval-raw-output-nullable.value-object";

describe("EvalRawOutputNullable", () => {
  it("round-trips a raw output payload", () => {
    expect(EvalRawOutputNullable.fromPrimitives("hello").toPrimitives()).toBe("hello");
  });

  it("normalizes nullish values to null", () => {
    expect(EvalRawOutputNullable.fromPrimitives(undefined).toPrimitives()).toBeNull();
    expect(EvalRawOutputNullable.empty().toPrimitives()).toBeNull();
  });
});
