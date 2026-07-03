import type { AvailableProviders } from "../value-objects/available-providers.value-object";

export interface EvalProviderCatalogRepository {
  list(): Promise<AvailableProviders>;
}
