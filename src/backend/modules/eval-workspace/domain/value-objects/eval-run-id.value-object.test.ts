import { describe, expect, it } from "vitest";
import { EvalRunId } from "./eval-run-id.value-object";

describe("EvalRunId", () => {
  it("round-trips a non-empty id", () => {
    expect(EvalRunId.fromPrimitives("run-1").toPrimitives()).toBe("run-1");
  });
});
