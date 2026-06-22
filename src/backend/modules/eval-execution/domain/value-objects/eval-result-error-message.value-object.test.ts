import { describe, expect, it } from "vitest";
import { EvalResultErrorMessage } from "./eval-result-error-message.value-object";

describe("EvalResultErrorMessage", () => {
  it("round-trips a message", () => {
    expect(EvalResultErrorMessage.fromPrimitives("Boom").toPrimitives()).toBe("Boom");
  });
});
