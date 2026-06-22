import { describe, expect, it } from "vitest";
import { EvalTemperature } from "./eval-temperature.value-object";

describe("EvalTemperature", () => {
  it("allows valid temperatures and round-trips them", () => {
    expect(EvalTemperature.fromPrimitives(0).toPrimitives()).toBe(0);
    expect(EvalTemperature.fromPrimitives(1.2).toPrimitives()).toBe(1.2);
    expect(EvalTemperature.fromPrimitives(2).toPrimitives()).toBe(2);
  });

  it("throws when temperature is out of bounds or invalid", () => {
    expect(() => EvalTemperature.fromPrimitives(-0.1)).toThrow(
      "Temperature must be a finite number between 0 and 2."
    );
    expect(() => EvalTemperature.fromPrimitives(2.1)).toThrow(
      "Temperature must be a finite number between 0 and 2."
    );
    expect(() => EvalTemperature.fromPrimitives(NaN)).toThrow(
      "Temperature must be a finite number between 0 and 2."
    );
  });
});
