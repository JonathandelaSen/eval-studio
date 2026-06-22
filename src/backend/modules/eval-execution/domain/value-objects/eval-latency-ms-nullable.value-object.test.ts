import { describe, expect, it } from "vitest";
import { EvalLatencyMsNullable } from "./eval-latency-ms-nullable.value-object";

describe("EvalLatencyMsNullable", () => {
  it("round-trips a latency measurement", () => {
    expect(EvalLatencyMsNullable.fromPrimitives(125).toPrimitives()).toBe(125);
  });

  it("normalizes nullish values to null", () => {
    expect(EvalLatencyMsNullable.fromPrimitives(null).toPrimitives()).toBeNull();
    expect(EvalLatencyMsNullable.fromPrimitives(undefined).toPrimitives()).toBeNull();
    expect(EvalLatencyMsNullable.empty().toPrimitives()).toBeNull();
  });
});
