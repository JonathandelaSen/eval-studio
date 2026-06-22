import { describe, expect, it } from "vitest";
import { EvalResultErrorCode } from "./eval-result-error-code.value-object";

describe("EvalResultErrorCode", () => {
  it("exposes semantic constructors and boolean checkers", () => {
    expect(EvalResultErrorCode.none().isNone()).toBe(true);
    expect(EvalResultErrorCode.provider().isProvider()).toBe(true);
    expect(EvalResultErrorCode.none().isProvider()).toBe(false);
  });

  it("round-trips a known code", () => {
    expect(EvalResultErrorCode.fromPrimitives("provider_error").toPrimitives()).toBe(
      "provider_error",
    );
  });

  it("rejects an unknown code", () => {
    expect(() =>
      EvalResultErrorCode.fromPrimitives("nope" as never),
    ).toThrow();
  });
});
