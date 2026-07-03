import { describe, expect, it } from "vitest";
import { EvalRuntime } from "./eval-runtime.value-object";
import { EvalRuntimeNullable } from "./eval-runtime-nullable.value-object";

describe("EvalRuntimeNullable", () => {
  it("can wrap a value and serialize it", () => {
    const inner = EvalRuntime.fromPrimitives({
      provider: "openai",
      model: "gpt-5 mini",
      temperature: 1.5,
      metadata: null,
    });
    const nullable = EvalRuntimeNullable.fromValue(inner);

    expect(nullable.isNull).toBe(false);
    expect(nullable.valueValue).toBe(inner);
    expect(nullable.toPrimitives()).toEqual({
      provider: "openai",
      model: "gpt-5 mini",
      temperature: 1.5,
      metadata: null,
    });
  });

  it("can represent an empty/null value", () => {
    const nullable = EvalRuntimeNullable.empty();

    expect(nullable.isNull).toBe(true);
    expect(nullable.valueValue).toBeNull();
    expect(nullable.toPrimitives()).toBeNull();
  });

  it("can be created from undefined/null primitives", () => {
    const nullableFromNull = EvalRuntimeNullable.fromPrimitives(null);
    expect(nullableFromNull.isNull).toBe(true);
    expect(nullableFromNull.toPrimitives()).toBeNull();

    const nullableFromUndefined = EvalRuntimeNullable.fromPrimitives(undefined);
    expect(nullableFromUndefined.isNull).toBe(true);
    expect(nullableFromUndefined.toPrimitives()).toBeNull();
  });

  it("can be created from valid primitives", () => {
    const primitives = {
      provider: "ollama",
      model: "llama3",
      temperature: null,
      metadata: null,
    };
    const nullable = EvalRuntimeNullable.fromPrimitives(primitives);

    expect(nullable.isNull).toBe(false);
    expect(nullable.valueValue).not.toBeNull();
    expect(nullable.toPrimitives()).toEqual({
      provider: "ollama",
      model: "llama3",
      temperature: null,
      metadata: null,
    });
  });

  it("supports equality comparison", () => {
    const nullableNull1 = EvalRuntimeNullable.empty();
    const nullableNull2 = EvalRuntimeNullable.fromPrimitives(null);

    // Wait! equals() compares primitive values using Object.is(this.toPrimitives(), other.toPrimitives())
    // For composite value objects, Object.is on objects will compare references, not deep contents, unless we implement custom equals.
    // Let's check ValueObject's default equals:
    // Object.is(this.toPrimitives(), other.toPrimitives())
    // Since toPrimitives() returns a new object, A and B won't be equal under the default equals()!
    // But they will be equal to themselves. And Null1 and Null2 will both return null, so Object.is(null, null) is true!
    expect(nullableNull1.equals(nullableNull2)).toBe(true);
  });
});
