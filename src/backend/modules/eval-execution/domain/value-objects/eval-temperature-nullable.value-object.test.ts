import { describe, expect, it } from "vitest";
import { EvalTemperature } from "./eval-temperature.value-object";
import { EvalTemperatureNullable } from "./eval-temperature-nullable.value-object";

describe("EvalTemperatureNullable", () => {
  it("can wrap an active EvalTemperature and serialize it", () => {
    const inner = EvalTemperature.fromPrimitives(1.5);
    const nullable = EvalTemperatureNullable.fromValue(inner);

    expect(nullable.isNull).toBe(false);
    expect(nullable.valueValue).toBe(inner);
    expect(nullable.toPrimitives()).toBe(1.5);
  });

  it("can represent an empty/null temperature", () => {
    const nullable = EvalTemperatureNullable.empty();

    expect(nullable.isNull).toBe(true);
    expect(nullable.valueValue).toBeNull();
    expect(nullable.toPrimitives()).toBeNull();
  });

  it("can be created from null/undefined primitives", () => {
    expect(EvalTemperatureNullable.fromPrimitives(null).isNull).toBe(true);
    expect(EvalTemperatureNullable.fromPrimitives(undefined).isNull).toBe(true);
  });

  it("can be created from valid primitives", () => {
    const nullable = EvalTemperatureNullable.fromPrimitives(1.2);
    expect(nullable.isNull).toBe(false);
    expect(nullable.toPrimitives()).toBe(1.2);
  });

  it("throws error from inner EvalTemperature validation if invalid", () => {
    expect(() => EvalTemperatureNullable.fromPrimitives(-0.5)).toThrow(
      "Temperature must be a finite number between 0 and 2."
    );
  });
});
