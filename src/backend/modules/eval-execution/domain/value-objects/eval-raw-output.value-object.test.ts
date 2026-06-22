import { describe, expect, it } from "vitest";
import { EvalRawOutput } from "./eval-raw-output.value-object";

describe("EvalRawOutput", () => {
  it("round-trips raw provider output", () => {
    expect(EvalRawOutput.fromPrimitives("{}").toPrimitives()).toBe("{}");
  });
});
