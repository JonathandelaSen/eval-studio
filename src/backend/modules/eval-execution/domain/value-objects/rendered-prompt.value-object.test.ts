import { describe, expect, it } from "vitest";
import { RenderedPrompt } from "./rendered-prompt.value-object";

describe("RenderedPrompt", () => {
  it("round-trips the rendered prompt payload", () => {
    const value = { format: "messages" };
    expect(RenderedPrompt.fromPrimitives(value).toPrimitives()).toEqual(value);
  });
});
