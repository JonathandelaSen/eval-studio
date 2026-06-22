import { describe, expect, it } from "vitest";
import { EvalUsageNullable } from "./eval-usage-nullable.value-object";

describe("EvalUsageNullable", () => {
  it("round-trips null usage", () => {
    expect(EvalUsageNullable.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
