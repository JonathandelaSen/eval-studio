import { describe, expect, it } from "vitest";
import { EvalProviderRequest } from "./eval-provider-request.value-object";

describe("EvalProviderRequest", () => {
  it("round-trips the exact provider request", () => {
    const request = {
      transport: "http" as const,
      target: "http://localhost:11434/api/chat",
      contentType: "application/json" as const,
      body: { model: "qwen", messages: [{ role: "user", content: "Hi" }] },
    };

    expect(EvalProviderRequest.fromPrimitives(request).toPrimitives()).toEqual(request);
  });

  it("supports historical results without a captured request", () => {
    expect(EvalProviderRequest.empty().toPrimitives()).toBeUndefined();
  });
});
