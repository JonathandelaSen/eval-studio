import { describe, expect, it } from "vitest";
import { LocalEvalProviderCatalogRepository } from "./local-eval-provider-catalog.repository";

describe("LocalEvalProviderCatalogRepository", () => {
  it("reports discovered Ollama and Apple models", async () => {
    const repository = new LocalEvalProviderCatalogRepository({
      ollama: { listModels: async () => [{ id: "llama", label: "llama" }] } as never,
      apple: { availability: async () => ({ available: true, model: "system-default" }) } as never,
    });
    const providers = (await repository.list()).toPrimitives();
    expect(providers.map((item) => item.id)).toEqual(["ollama", "apple"]);
    expect(providers.every((item) => item.available)).toBe(true);
  });
});
