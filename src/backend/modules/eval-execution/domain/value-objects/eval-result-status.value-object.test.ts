import { describe, expect, it } from "vitest";
import { EvalResultStatus } from "./eval-result-status.value-object";

describe("EvalResultStatus", () => {
  it("round-trips the allowed statuses", () => {
    expect(EvalResultStatus.fromPrimitives("completed").toPrimitives()).toBe("completed");
    expect(EvalResultStatus.failed().toPrimitives()).toBe("failed");
  });

  it("rejects unknown statuses", () => {
    expect(() => EvalResultStatus.fromPrimitives("pending")).toThrow();
  });
});
