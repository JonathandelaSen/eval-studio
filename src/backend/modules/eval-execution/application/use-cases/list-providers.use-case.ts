import type { EvalProviderCatalogRepository } from "../../domain/repositories/eval-provider-catalog.repository";
import type { AvailableProviders } from "../../domain/value-objects/available-providers.value-object";

export class ListProvidersUseCase {
  constructor(private readonly deps: { catalogRepository: EvalProviderCatalogRepository }) {}
  execute(): Promise<AvailableProviders> { return this.deps.catalogRepository.list(); }
}
