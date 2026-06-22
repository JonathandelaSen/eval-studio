import { describe, expect, it } from "vitest";
import { HumanScore } from "./human-score.value-object";

describe("HumanScore", () => {
  it("round-trips scores from zero to five", () => {
    expect(HumanScore.fromPrimitives(5).toPrimitives()).toBe(5);
  });

  it("rejects scores outside the scale", () => {
    expect(() => HumanScore.fromPrimitives(6)).toThrow();
  });
});
