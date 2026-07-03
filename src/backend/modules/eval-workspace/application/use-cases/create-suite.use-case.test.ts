import { describe, expect, it } from "vitest";
import { CreateSuiteUseCase } from "./create-suite.use-case";

describe("CreateSuiteUseCase", () => {
  it("saves an empty suite", async () => {
    const useCase = new CreateSuiteUseCase({
      suiteRepository: { save: async (_root: unknown, suite: never) => suite } as never,
      idFactory: () => "550e8400-e29b-41d4-a716-446655440000",
    });
    const suite = await useCase.execute({ name: "Support" });
    expect(suite.toPrimitives()).toMatchObject({ name: "Support", caseIds: [] });
  });
});
