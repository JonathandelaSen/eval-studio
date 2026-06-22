import { describe, expect, it } from "vitest";
import { ResultId } from "./result-id.value-object";

describe("ResultId", () => {
  it("round-trips a non-empty id", () => {
    expect(ResultId.fromPrimitives("result-1").toPrimitives()).toBe("result-1");
  });
});
