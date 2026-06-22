import { describe, expect, it } from "vitest";
import { EvalLatencyMs } from "./eval-latency-ms.value-object";

describe("EvalLatencyMs", () => {
  it("round-trips non-negative latency", () => {
    expect(EvalLatencyMs.fromPrimitives(12).toPrimitives()).toBe(12);
  });

  it("rejects negative latency", () => {
    expect(() => EvalLatencyMs.fromPrimitives(-1)).toThrow();
  });
});
