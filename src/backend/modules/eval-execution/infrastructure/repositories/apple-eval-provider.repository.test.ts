import { describe, expect, it } from "vitest";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { EvalProvider } from "../../domain/value-objects/eval-provider.value-object";
import { RenderedPrompt } from "../../domain/value-objects/rendered-prompt.value-object";
import { AppleEvalProviderRepository } from "./apple-eval-provider.repository";

describe("AppleEvalProviderRepository", () => {
  it("reports the system model returned by the native helper", async () => {
    const provider = new AppleEvalProviderRepository({
      runHelper: async () => ({ available: true, model: "system-default", systemVersion: "26.4" }),
    });
    await expect(provider.availability()).resolves.toEqual({
      available: true,
      model: "system-default",
      systemVersion: "26.4",
    });
  });

  it("executes instructions and a prompt through the native helper", async () => {
    const provider = new AppleEvalProviderRepository({
      runHelper: async (payload) => ({ output: `${payload.instructions}|${payload.prompt}` }),
    });
    const result = await provider.execute({
      provider: EvalProvider.apple(),
      model: EvalModel.fromPrimitives("system-default"),
      renderedPrompt: RenderedPrompt.fromPrimitives({
        format: "messages",
        messages: [
          { role: "system", content: "Be concise" },
          { role: "user", content: "Hello" },
        ],
      }),
    });
    expect(result.toPrimitives().rawOutput).toBe("Be concise|Hello");
  });
});
