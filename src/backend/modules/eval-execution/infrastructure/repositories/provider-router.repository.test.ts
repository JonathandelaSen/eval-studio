import { describe, expect, it } from "vitest";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { EvalProvider } from "../../domain/value-objects/eval-provider.value-object";
import { RenderedPrompt } from "../../domain/value-objects/rendered-prompt.value-object";
import { ProviderRouterRepository } from "./provider-router.repository";

describe("ProviderRouterRepository", () => {
  it("delegates execution to the selected provider", async () => {
    const calls: string[] = [];
    const router = new ProviderRouterRepository({
      mock: { execute: async () => (calls.push("mock"), {} as never) },
      ollama: { execute: async () => (calls.push("ollama"), {} as never) },
      apple: { execute: async () => (calls.push("apple"), {} as never) },
    });
    await router.execute({
      provider: EvalProvider.ollama(),
      model: EvalModel.fromPrimitives("llama"),
      renderedPrompt: RenderedPrompt.fromPrimitives({ format: "text", text: "Hi" }),
    });
    expect(calls).toEqual(["ollama"]);
  });
});
