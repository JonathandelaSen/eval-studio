import { describe, expect, it } from "vitest";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import { ExecuteRunUseCase } from "./execute-run.use-case";
import { EvalProviderRequest } from "../../domain/value-objects/eval-provider-request.value-object";

describe("ExecuteRunUseCase", () => {
  it("continues after a failed case and completes with failures", async () => {
    const savedRuns: string[] = [];
    const savedResults: Array<Record<string, unknown>> = [];
    const run = EvalRun.fromPrimitives({
      runId: "run-1",
      name: "Local run",
      suiteId: "987f6543-e21b-32d1-b654-246614174111",
      producer: "eval-studio",
      createdAt: "2026-07-03T10:00:00.000Z",
      caseIds: [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
      ],
      runtime: { provider: "mock", model: "mock-model", temperature: null },
      notes: null,
      status: "queued",
    });
    let attempts = 0;
    const useCase = new ExecuteRunUseCase({
      providerRepository: {
        prepare: (input) => EvalProviderRequest.fromPrimitives({
          transport: "in-memory",
          target: "mock",
          contentType: "application/json",
          body: {
            model: input.model.toPrimitives(),
            prompt: input.renderedPrompt.toPrimitives(),
          },
        }),
        execute: async () => {
          attempts += 1;
          if (attempts === 1) throw new Error("boom");
          return EvalPromptExecution.fromPrimitives({
            rawOutput: "ok",
            parsedOutput: "ok",
            usage: null,
            latencyMs: 1,
          });
        },
      },
      runRepository: {
        save: async (_root: unknown, value: EvalRun) => {
          savedRuns.push(value.toPrimitives().status);
          return value;
        },
      } as never,
      resultRepository: {
        save: async (_root, value) => {
          savedResults.push(value.toPrimitives() as unknown as Record<string, unknown>);
          return value;
        },
      },
      eventBus: new InMemoryEventBus(new NoOpTelemetry()),
    });

    await useCase.execute({
      workspaceRoot: "/tmp/evals",
      run,
      cases: [
        {
          caseId: "550e8400-e29b-41d4-a716-446655440000",
          suiteId: "987f6543-e21b-32d1-b654-246614174111",
          name: "One",
          createdAt: "2026-07-03T10:00:00.000Z",
          renderedPrompt: { format: "messages", messages: [{ role: "user", content: "one" }] },
        },
        {
          caseId: "550e8400-e29b-41d4-a716-446655440001",
          suiteId: "987f6543-e21b-32d1-b654-246614174111",
          name: "Two",
          createdAt: "2026-07-03T10:00:00.000Z",
          renderedPrompt: { format: "messages", messages: [{ role: "user", content: "two" }] },
        },
      ],
    });

    expect(savedResults.map((result) => result.status)).toEqual(["failed", "completed"]);
    expect(savedResults.map((result) => result.providerRequest)).toEqual([
      {
        transport: "in-memory",
        target: "mock",
        contentType: "application/json",
        body: {
          model: "mock-model",
          prompt: {
            format: "messages",
            messages: [{ role: "user", content: "one" }],
          },
        },
      },
      {
        transport: "in-memory",
        target: "mock",
        contentType: "application/json",
        body: {
          model: "mock-model",
          prompt: {
            format: "messages",
            messages: [{ role: "user", content: "two" }],
          },
        },
      },
    ]);
    expect(savedRuns).toEqual(["running", "completed_with_failures"]);
  });
});
