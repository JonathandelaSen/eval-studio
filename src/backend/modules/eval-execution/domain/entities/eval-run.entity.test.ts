import { describe, expect, it } from "vitest";
import { Timestamp } from "@/backend/modules/shared";
import { CaseIds } from "../value-objects/case-ids.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { EvalProvider } from "../value-objects/eval-provider.value-object";
import { EvalModel } from "../value-objects/eval-model.value-object";
import { RunName } from "../value-objects/run-name.value-object";
import { EvalRuntimeNullable } from "../value-objects/eval-runtime-nullable.value-object";
import { RunNotesNullable } from "../value-objects/run-notes-nullable.value-object";
import { SuiteId } from "../value-objects/suite-id.value-object";
import { EvalRun } from "./eval-run.entity";

describe("EvalRun", () => {
  it("creates a run with domain defaults", () => {
    const createdAt = Timestamp.fromPrimitives("2026-06-22T10:15:30.000Z");
    const producer = Producer.evalStudio();
    const suiteUuid = "987f6543-e21b-32d1-b654-246614174111";
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const evalRun = EvalRun.create({
      id: EvalRunId.create({
        createdAt,
        producer,
        provider: EvalProvider.openai(),
        model: EvalModel.fromPrimitives("gpt-5 mini"),
      }),
      name: RunName.fromPrimitives("Run 1"),
      suiteId: SuiteId.fromPrimitives(suiteUuid),
      producer,
      createdAt,
      caseIds: CaseIds.fromPrimitives([caseUuid]),
      runtime: EvalRuntimeNullable.fromPrimitives({
        provider: "openai",
        model: "gpt-5 mini",
        temperature: null,
      }),
      notes: RunNotesNullable.empty(),
    });

    expect(evalRun.toPrimitives()).toMatchObject({
      name: "Run 1",
      suiteId: suiteUuid,
      status: "queued",
      producer: "eval-studio",
      caseIds: [caseUuid],
      runtime: {
        provider: "openai",
        model: "gpt-5 mini",
      },
    });
    expect(evalRun.id.toPrimitives()).toContain(".eval-studio-openai-gpt-5-mini");
  });

  it("records a run-created event on creation", () => {
    const createdAt = Timestamp.fromPrimitives("2026-06-22T10:15:30.000Z");
    const producer = Producer.evalStudio();
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const evalRun = EvalRun.create({
      id: EvalRunId.create({
        createdAt,
        producer,
        provider: EvalProvider.openai(),
        model: EvalModel.fromPrimitives("gpt-5 mini"),
      }),
      name: RunName.fromPrimitives("Run 1"),
      suiteId: SuiteId.fromPrimitives("987f6543-e21b-32d1-b654-246614174111"),
      producer,
      createdAt,
      caseIds: CaseIds.fromPrimitives([caseUuid]),
      runtime: EvalRuntimeNullable.empty(),
      notes: RunNotesNullable.empty(),
    });

    const events = evalRun.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe("eval_execution.run_created.1");
    expect(events[0].toPrimitives()).toEqual(evalRun.toPrimitives());
  });

  it("hydrates identities and round-trips primitives", () => {
    const suiteUuid = "987f6543-e21b-32d1-b654-246614174111";
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const run = EvalRun.fromPrimitives({
      runId: "run-1",
      name: "Run 1",
      suiteId: suiteUuid,
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:00.000Z",
      caseIds: [caseUuid],
      runtime: null,
      notes: null,
      status: "running",
    });

    expect(run.id.toPrimitives()).toBe("run-1");
    expect(run.suiteId.toPrimitives()).toBe(suiteUuid);
    expect(run.toPrimitives().caseIds).toEqual([caseUuid]);
  });

  it("moves through the persisted run lifecycle", () => {
    const run = EvalRun.fromPrimitives({
      runId: "run-1",
      name: "Run 1",
      suiteId: "987f6543-e21b-32d1-b654-246614174111",
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:00.000Z",
      caseIds: ["550e8400-e29b-41d4-a716-446655440000"],
      runtime: null,
      notes: null,
      status: "queued",
    });

    run.markRunning();
    expect(run.toPrimitives().status).toBe("running");
    run.markCompleted(true);
    expect(run.toPrimitives().status).toBe("completed_with_failures");
  });
});
