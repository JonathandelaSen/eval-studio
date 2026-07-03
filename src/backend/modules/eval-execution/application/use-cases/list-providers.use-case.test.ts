import { describe, expect, it } from "vitest";
import { AvailableProviders } from "../../domain/value-objects/available-providers.value-object";
import { ListProvidersUseCase } from "./list-providers.use-case";

describe("ListProvidersUseCase", () => {
  it("returns the catalog value object", async () => {
    const providers = AvailableProviders.fromPrimitives([]);
    const useCase = new ListProvidersUseCase({ catalogRepository: { list: async () => providers } });
    await expect(useCase.execute()).resolves.toBe(providers);
  });
});
