import { describe, expect, it } from "vitest";
import { EvalResult } from "./eval-result.entity";
import { ResultId } from "../value-objects/result-id.value-object";
import { CaseId } from "../value-objects/case-id.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { Timestamp } from "@/backend/modules/shared";
import { EvalRuntimeNullable } from "../value-objects/eval-runtime-nullable.value-object";
import { PromptVariables } from "../value-objects/prompt-variables.value-object";
import { RenderedPrompt } from "../value-objects/rendered-prompt.value-object";
import { EvalRawOutputNullable } from "../value-objects/eval-raw-output-nullable.value-object";
import { EvalParsedOutputNullable } from "../value-objects/eval-parsed-output-nullable.value-object";
import { EvalResultError } from "../value-objects/eval-result-error.value-object";
import { EvalUsageNullable } from "../value-objects/eval-usage-nullable.value-object";
import { EvalLatencyMsNullable } from "../value-objects/eval-latency-ms-nullable.value-object";
import { EvalResultCompletedEvent } from "../events/eval-result-completed.event";
import { EvalResultFailedEvent } from "../events/eval-result-failed.event";
import { EvalProviderRequest } from "../value-objects/eval-provider-request.value-object";

describe("EvalResult", () => {
  it("hydrates identities and round-trips primitives", () => {
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = EvalResult.fromPrimitives({
      resultId: "result-1",
      caseId: caseUuid,
      runId: "run-1",
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:00.000Z",
      renderedPrompt: { format: "messages", messages: [] },
      rawOutput: null,
      parsedOutput: null,
      status: "failed",
      error: { message: "Nope" },
    });

    expect(result.toPrimitives().resultId).toBe("result-1");
    expect(result.toPrimitives().status).toBe("failed");
  });

  it("records a completed event when a success result is created", () => {
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = EvalResult.createSuccess({
      id: ResultId.fromPrimitives("result-1"),
      caseId: CaseId.fromPrimitives(caseUuid),
      runId: EvalRunId.fromPrimitives("run-1"),
      producer: Producer.fromPrimitives("eval-studio"),
      createdAt: Timestamp.fromPrimitives("2026-06-22T00:00:00.000Z"),
      runtime: EvalRuntimeNullable.empty(),
      promptVariables: PromptVariables.empty(),
      renderedPrompt: RenderedPrompt.fromPrimitives({ format: "messages", messages: [] }),
      providerRequest: EvalProviderRequest.empty(),
      rawOutput: EvalRawOutputNullable.fromPrimitives("ok"),
      parsedOutput: EvalParsedOutputNullable.fromPrimitives({ score: 1 }),
      usage: EvalUsageNullable.fromPrimitives(null),
      latencyMs: EvalLatencyMsNullable.fromPrimitives(42),
    });

    const events = result.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(EvalResultCompletedEvent);
    expect(result.toPrimitives().status).toBe("completed");
    expect(result.toPrimitives().latencyMs).toBe(42);
  });

  it("records a failed event when a failed result is created", () => {
    const caseUuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = EvalResult.createFailed({
      id: ResultId.fromPrimitives("result-1"),
      caseId: CaseId.fromPrimitives(caseUuid),
      runId: EvalRunId.fromPrimitives("run-1"),
      producer: Producer.fromPrimitives("eval-studio"),
      createdAt: Timestamp.fromPrimitives("2026-06-22T00:00:00.000Z"),
      runtime: EvalRuntimeNullable.empty(),
      promptVariables: PromptVariables.empty(),
      renderedPrompt: RenderedPrompt.fromPrimitives({ format: "messages", messages: [] }),
      providerRequest: EvalProviderRequest.empty(),
      error: EvalResultError.providerError("Some error"),
    });

    const events = result.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(EvalResultFailedEvent);
    expect(result.toPrimitives().status).toBe("failed");
    expect(result.toPrimitives().error?.message).toBe("Some error");
    expect(result.toPrimitives().rawOutput).toBeNull();
  });
});
