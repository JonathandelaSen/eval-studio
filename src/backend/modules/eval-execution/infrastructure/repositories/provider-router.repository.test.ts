import { describe, expect, it } from "vitest";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { EvalProvider } from "../../domain/value-objects/eval-provider.value-object";
import { RenderedPrompt } from "../../domain/value-objects/rendered-prompt.value-object";
import { ProviderRouterRepository } from "./provider-router.repository";
import { EvalProviderRequest } from "../../domain/value-objects/eval-provider-request.value-object";

describe("ProviderRouterRepository", () => {
  it("delegates execution to the selected provider", async () => {
    const calls: string[] = [];
    const prepare = () => EvalProviderRequest.fromPrimitives({
      transport: "in-memory" as const,
      target: "test",
      contentType: "application/json" as const,
      body: {},
    });
    const router = new ProviderRouterRepository({
      mock: { prepare, execute: async () => (calls.push("mock"), {} as never) },
      ollama: { prepare, execute: async () => (calls.push("ollama"), {} as never) },
      apple: { prepare, execute: async () => (calls.push("apple"), {} as never) },
    });
    await router.execute({
      provider: EvalProvider.ollama(),
      model: EvalModel.fromPrimitives("llama"),
      renderedPrompt: RenderedPrompt.fromPrimitives({ format: "text", text: "Hi" }),
    });
    expect(calls).toEqual(["ollama"]);
  });
});
