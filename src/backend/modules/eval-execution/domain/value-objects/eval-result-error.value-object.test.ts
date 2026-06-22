import { describe, expect, it } from "vitest";
import { EvalResultError } from "./eval-result-error.value-object";

describe("EvalResultError", () => {
  it("round-trips an error payload", () => {
    const error = { message: "Boom", code: "provider_error" } as const;
    expect(EvalResultError.fromPrimitives(error).toPrimitives()).toEqual(error);
  });

  it("represents the absence of an error as null", () => {
    expect(EvalResultError.none().toPrimitives()).toBeNull();
    expect(EvalResultError.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
