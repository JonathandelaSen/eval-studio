import type { EvalProviderCatalogRepository } from "../../domain/repositories/eval-provider-catalog.repository";
import { AvailableProviders } from "../../domain/value-objects/available-providers.value-object";
import type { AppleEvalProviderRepository } from "./apple-eval-provider.repository";
import type { OllamaEvalProviderRepository } from "./ollama-eval-provider.repository";

export class LocalEvalProviderCatalogRepository implements EvalProviderCatalogRepository {
  constructor(private readonly deps: { ollama: OllamaEvalProviderRepository; apple: AppleEvalProviderRepository }) {}

  async list(): Promise<AvailableProviders> {
    const [ollama, apple] = await Promise.all([this.ollama(), this.apple()]);
    return AvailableProviders.fromPrimitives([ollama, apple]);
  }

  private async ollama() {
    try {
      const models = await this.deps.ollama.listModels();
      return { id: "ollama" as const, label: "Ollama", available: models.length > 0, ...(models.length ? {} : { reason: "No installed models found." }), models };
    } catch (error) {
      return { id: "ollama" as const, label: "Ollama", available: false, reason: error instanceof Error ? error.message : "Ollama is unavailable.", models: [] };
    }
  }

  private async apple() {
    try {
      const value = await this.deps.apple.availability();
      return { id: "apple" as const, label: "Apple Intelligence", available: value.available === true, ...(value.available ? {} : { reason: value.reason ?? "System model unavailable." }), models: value.available ? [{ id: value.model ?? "system-default", label: "System Model" }] : [] };
    } catch (error) {
      return { id: "apple" as const, label: "Apple Intelligence", available: false, reason: error instanceof Error ? error.message : "Apple system model is unavailable.", models: [] };
    }
  }
}
