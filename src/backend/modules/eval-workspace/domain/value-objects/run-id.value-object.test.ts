import { describe, expect, it } from "vitest";
import { RunId } from "./run-id.value-object";

describe("RunId", () => {
  it("round-trips a non-empty id", () => {
    expect(RunId.fromPrimitives("run-1").toPrimitives()).toBe("run-1");
  });
});
