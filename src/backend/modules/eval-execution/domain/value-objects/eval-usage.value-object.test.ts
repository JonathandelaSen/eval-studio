import { describe, expect, it } from "vitest";
import { EvalUsage } from "./eval-usage.value-object";

describe("EvalUsage", () => {
  it("round-trips null usage", () => {
    expect(EvalUsage.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
