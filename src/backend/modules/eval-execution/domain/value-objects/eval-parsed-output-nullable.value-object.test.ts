import { describe, expect, it } from "vitest";
import { EvalParsedOutputNullable } from "./eval-parsed-output-nullable.value-object";

describe("EvalParsedOutputNullable", () => {
  it("round-trips parsed provider output", () => {
    const value = { ok: true };
    expect(EvalParsedOutputNullable.fromPrimitives(value).toPrimitives()).toEqual(value);
  });

  it("normalizes nullish values to null", () => {
    expect(EvalParsedOutputNullable.fromPrimitives(undefined).toPrimitives()).toBeNull();
    expect(EvalParsedOutputNullable.empty().toPrimitives()).toBeNull();
  });
});
