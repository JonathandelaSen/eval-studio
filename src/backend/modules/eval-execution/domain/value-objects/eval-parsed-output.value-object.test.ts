import { describe, expect, it } from "vitest";
import { EvalParsedOutput } from "./eval-parsed-output.value-object";

describe("EvalParsedOutput", () => {
  it("round-trips parsed provider output", () => {
    const value = { ok: true };
    expect(EvalParsedOutput.fromPrimitives(value).toPrimitives()).toEqual(value);
  });
});
