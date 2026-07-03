import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CreateRunUseCase, type CreateRunInput } from "./create-run.use-case";
import { FilesystemEvalRunRepository } from "../../infrastructure/repositories/filesystem-eval-run.repository";
import { FilesystemEvalResultRepository } from "../../infrastructure/repositories/filesystem-eval-result.repository";
import { MockEvalProviderRepository } from "../../infrastructure/repositories/mock-eval-provider.repository";
import type {
  EvalProviderExecutionInput,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";
import type { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";
import type { EvalCase } from "../../../eval-workspace";

const actionUuid = "987f6543-e21b-32d1-b654-246614174111";
const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
const secondCaseUuid = "550e8400-e29b-41d4-a716-446655440001";

function buildCase(caseId: string, name: string): EvalCase {
  return {
    caseId,
    actionId: actionUuid,
    name,
    createdAt: "2026-06-22T00:00:00.000Z",
    renderedPrompt: { format: "messages", messages: [] },
  };
}

class ThrowingEvalProviderRepository implements EvalProviderRepository {
  constructor(private readonly message: string) {}

  execute(_input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    return Promise.reject(new Error(this.message));
  }
}

class RecordingEvalProviderRepository implements EvalProviderRepository {
  readonly inputs: EvalProviderExecutionInput[] = [];

  constructor(private readonly delegate: EvalProviderRepository) {}

  execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    this.inputs.push(input);
    return this.delegate.execute(input);
  }
}

describe("CreateRunUseCase", () => {
  let workspaceRoot: string;
  let eventBus: InMemoryEventBus;

  beforeEach(async () => {
    workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
    eventBus = new InMemoryEventBus(new NoOpTelemetry());
  });

  afterEach(async () => {
    await rm(workspaceRoot, { recursive: true, force: true });
  });

  function buildInput(overrides: Partial<CreateRunInput> = {}): CreateRunInput {
    return {
      workspaceRoot,
      name: "Mock run",
      actionId: actionUuid,
      caseIds: [caseUuid],
      cases: [buildCase(caseUuid, "Case 1")],
      provider: "mock",
      model: "mock-model",
      ...overrides,
    };
  }

  function buildUseCase(
    providerRepository: EvalProviderRepository = new MockEvalProviderRepository(),
  ) {
    return new CreateRunUseCase({
      providerRepository,
      runRepository: new FilesystemEvalRunRepository(),
      resultRepository: new FilesystemEvalResultRepository(),
      eventBus,
    });
  }

  it("persists the run and one completed result per selected case", async () => {
    const run = await buildUseCase().execute(buildInput());
    const runId = run.toPrimitives().runId;

    expect(run.toPrimitives().caseIds).toEqual([caseUuid]);

    const runArtifact = await readFile(
      path.join(workspaceRoot, "runs", runId, "run.json"),
      "utf8",
    );
    expect(JSON.parse(runArtifact).name).toBe("Mock run");

    const resultArtifact = await readFile(
      path.join(workspaceRoot, "runs", runId, "results", `${caseUuid}.result.json`),
      "utf8",
    );
    expect(JSON.parse(resultArtifact).status).toBe("completed");

    const publishedEvents = eventBus.getEvents();
    expect(publishedEvents).toHaveLength(2);
    expect(publishedEvents[0].eventName).toBe("eval_execution.run_created.1");
    expect(publishedEvents[0].toPrimitives()).toEqual(run.toPrimitives());
    expect(publishedEvents[1].eventName).toBe("eval_execution.result_completed.1");
  });

  it("only runs the selected cases and ignores the rest", async () => {
    const run = await buildUseCase().execute(
      buildInput({
        caseIds: [caseUuid],
        cases: [buildCase(caseUuid, "Case 1"), buildCase(secondCaseUuid, "Case 2")],
      }),
    );

    expect(run.toPrimitives().caseIds).toEqual([caseUuid]);

    const publishedEvents = eventBus.getEvents();
    expect(publishedEvents).toHaveLength(2);
    expect(publishedEvents[1].eventName).toBe("eval_execution.result_completed.1");
  });

  it("persists one completed result per selected case", async () => {
    const run = await buildUseCase().execute(
      buildInput({
        caseIds: [caseUuid, secondCaseUuid],
        cases: [buildCase(caseUuid, "Case 1"), buildCase(secondCaseUuid, "Case 2")],
      }),
    );
    const runId = run.toPrimitives().runId;

    expect(run.toPrimitives().caseIds).toEqual([caseUuid, secondCaseUuid]);

    for (const id of [caseUuid, secondCaseUuid]) {
      const resultArtifact = await readFile(
        path.join(workspaceRoot, "runs", runId, "results", `${id}.result.json`),
        "utf8",
      );
      expect(JSON.parse(resultArtifact).status).toBe("completed");
    }

    const publishedEvents = eventBus.getEvents();
    expect(publishedEvents).toHaveLength(3);
    expect(publishedEvents[0].eventName).toBe("eval_execution.run_created.1");
    expect(publishedEvents[1].eventName).toBe("eval_execution.result_completed.1");
    expect(publishedEvents[2].eventName).toBe("eval_execution.result_completed.1");
  });

  it("records a failed result when the provider throws", async () => {
    const run = await buildUseCase(
      new ThrowingEvalProviderRepository("provider exploded"),
    ).execute(buildInput());
    const runId = run.toPrimitives().runId;

    const resultArtifact = await readFile(
      path.join(workspaceRoot, "runs", runId, "results", `${caseUuid}.result.json`),
      "utf8",
    );
    expect(JSON.parse(resultArtifact).status).toBe("failed");

    const publishedEvents = eventBus.getEvents();
    expect(publishedEvents).toHaveLength(2);
    expect(publishedEvents[0].eventName).toBe("eval_execution.run_created.1");
    expect(publishedEvents[1].eventName).toBe("eval_execution.result_failed.1");
  });

  it("forwards the configured temperature to the provider", async () => {
    const provider = new RecordingEvalProviderRepository(
      new MockEvalProviderRepository(),
    );

    await buildUseCase(provider).execute(buildInput({ temperature: 0.7 }));

    expect(provider.inputs).toHaveLength(1);
    expect(provider.inputs[0].temperature?.toPrimitives()).toBe(0.7);
  });

  it("leaves the temperature unset when none is provided", async () => {
    const provider = new RecordingEvalProviderRepository(
      new MockEvalProviderRepository(),
    );

    await buildUseCase(provider).execute(buildInput());

    expect(provider.inputs).toHaveLength(1);
    expect(provider.inputs[0].temperature).toBeUndefined();
  });
});
