import { describe, expect, it } from "vitest";
import { CreateCaseUseCase } from "./create-case.use-case";

describe("CreateCaseUseCase", () => {
  it("stores a user-only prompt as the exact text authored", async () => {
    const useCase = new CreateCaseUseCase({
      caseRepository: { save: async (_root: unknown, value: never) => value } as never,
      suiteRepository: {
        find: async () => ({ addCase() {}, toPrimitives: () => ({}) }),
        save: async (_root: unknown, value: never) => value,
      } as never,
      idFactory: () => "987f6543-e21b-32d1-b654-246614174111",
      now: () => "2026-07-03T10:00:00.000Z",
    });

    const created = await useCase.execute({
      workspaceRoot: "/tmp/evals",
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Phrase completion",
      userMessage: "puedes refactorizar este ",
    });

    expect(created.toPrimitives().renderedPrompt).toEqual({
      format: "text",
      text: "puedes refactorizar este",
    });
  });

  it("creates an executable messages case inside its suite", async () => {
    const saved: unknown[] = [];
    const useCase = new CreateCaseUseCase({
      caseRepository: { save: async (_root: unknown, value: never) => (saved.push(value), value) } as never,
      suiteRepository: {
        find: async () => ({ addCase() {}, toPrimitives: () => ({}) }),
        save: async (_root: unknown, value: never) => value,
      } as never,
      idFactory: () => "987f6543-e21b-32d1-b654-246614174111",
      now: () => "2026-07-03T10:00:00.000Z",
    });

    const created = await useCase.execute({
      workspaceRoot: "/tmp/evals",
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Refund policy",
      note: "Stay grounded",
      expectedOutput: "No. Mention the 30-day limit.",
      systemInstruction: "Use only policy facts.",
      userMessage: "Can this item be returned?",
    });

    expect(created.toPrimitives()).toMatchObject({
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Refund policy",
      expectedOutput: "No. Mention the 30-day limit.",
      renderedPrompt: {
        format: "messages",
        messages: [
          { role: "system", content: "Use only policy facts." },
          { role: "user", content: "Can this item be returned?" },
        ],
      },
    });
    expect(saved).toHaveLength(1);
  });
});
