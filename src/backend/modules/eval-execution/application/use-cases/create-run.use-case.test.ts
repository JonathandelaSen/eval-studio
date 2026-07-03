import { describe, expect, it } from "vitest";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";
import { CreateRunUseCase } from "./create-run.use-case";

describe("CreateRunUseCase", () => {
  it("persists a queued run owned by one suite", async () => {
    const saved: unknown[] = [];
    const useCase = new CreateRunUseCase({
      runRepository: {
        save: async (_root: unknown, run: { toPrimitives(): unknown }) => (saved.push(run.toPrimitives()), run),
      } as never,
      eventBus: new InMemoryEventBus(new NoOpTelemetry()),
    });
    const run = await useCase.execute({
      workspaceRoot: "/tmp/evals",
      name: "Apple run",
      suiteId: "987f6543-e21b-32d1-b654-246614174111",
      caseIds: ["550e8400-e29b-41d4-a716-446655440000"],
      provider: "apple",
      model: "system-default",
    });
    expect(run.toPrimitives()).toMatchObject({
      suiteId: "987f6543-e21b-32d1-b654-246614174111",
      status: "queued",
      runtime: { provider: "apple", model: "system-default" },
    });
    expect(saved).toHaveLength(1);
  });
});
