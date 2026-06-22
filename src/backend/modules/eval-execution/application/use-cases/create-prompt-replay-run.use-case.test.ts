import { describe, expect, it } from "vitest";
import { CreatePromptReplayRunUseCase } from "./create-prompt-replay-run.use-case";
import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import { EvalResult } from "../../domain/entities/eval-result.entity";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import type { EvalProviderRepository } from "../../domain/repositories/eval-provider.repository";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

describe("CreatePromptReplayRunUseCase", () => {
  it("writes a run first and then one result per selected case", async () => {
    const writes: Array<EvalRun | EvalResult> = [];
    const runRepository: EvalRunRepository = {
      save: async (run) => {
        writes.push(run);
        return run;
      },
      saveResult: async (result) => {
        writes.push(result);
        return result;
      },
    };
    const providerRepository: EvalProviderRepository = {
      execute: async () => EvalPromptExecution.fromPrimitives({
        rawOutput: "{\"ok\":true}",
        parsedOutput: { ok: true },
        usage: null,
        latencyMs: 12,
      }),
    };

    const run = await new CreatePromptReplayRunUseCase({
      providerRepository,
      runRepository,
    }).execute({
      name: "Mock run",
      actionId: "action.score",
      caseIds: ["case-1"],
      cases: [
        {
          schemaVersion: "1",
          caseId: "case-1",
          actionId: "action.score",
          name: "Case 1",
          createdAt: "2026-06-22T00:00:00.000Z",
          renderedPrompt: { format: "messages", messages: [] },
        },
      ],
      provider: "mock",
      model: "mock-model",
    });

    expect(run.toPrimitives().caseIds).toEqual(["case-1"]);
    expect(writes).toHaveLength(2);
    expect(writes[0]).toBeInstanceOf(EvalRun);
    expect((writes[1] as EvalResult).toPrimitives().status).toBe("completed");
  });

  it("persists failed results when provider execution fails", async () => {
    const results: EvalResult[] = [];
    const runRepository: EvalRunRepository = {
      save: async (run) => run,
      saveResult: async (result) => {
        results.push(result);
        return result;
      },
    };
    const providerRepository: EvalProviderRepository = {
      execute: async () => {
        throw new Error("Provider down");
      },
    };

    await new CreatePromptReplayRunUseCase({
      providerRepository,
      runRepository,
    }).execute({
      name: "Mock run",
      actionId: "action.score",
      caseIds: ["case-1"],
      cases: [
        {
          schemaVersion: "1",
          caseId: "case-1",
          actionId: "action.score",
          name: "Case 1",
          createdAt: "2026-06-22T00:00:00.000Z",
          renderedPrompt: { format: "messages", messages: [] },
        },
      ],
      provider: "mock",
      model: "mock-model",
    });

    expect(results[0]?.toPrimitives().status).toBe("failed");
    expect(results[0]?.toPrimitives().error?.message).toBe("Provider down");
  });
});
