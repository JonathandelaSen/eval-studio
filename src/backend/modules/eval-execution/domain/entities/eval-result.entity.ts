import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import { CaseId } from "../value-objects/case-id.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { ResultId } from "../value-objects/result-id.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { EvalRuntimeNullable } from "../value-objects/eval-runtime-nullable.value-object";
import { PromptVariables } from "../value-objects/prompt-variables.value-object";
import type { PromptVariablesValue } from "../value-objects/prompt-variables.value-object";
import { RenderedPrompt } from "../value-objects/rendered-prompt.value-object";
import type { RenderedPromptPrimitives } from "../value-objects/rendered-prompt.value-object";
import { EvalRawOutputNullable } from "../value-objects/eval-raw-output-nullable.value-object";
import { EvalParsedOutputNullable } from "../value-objects/eval-parsed-output-nullable.value-object";
import { EvalResultStatus } from "../value-objects/eval-result-status.value-object";
import type { EvalResultStatusValue } from "../value-objects/eval-result-status.value-object";
import { EvalResultError } from "../value-objects/eval-result-error.value-object";
import { EvalUsageNullable } from "../value-objects/eval-usage-nullable.value-object";
import { EvalLatencyMsNullable } from "../value-objects/eval-latency-ms-nullable.value-object";
import { EvalResultCompletedEvent } from "../events/eval-result-completed.event";
import { EvalResultFailedEvent } from "../events/eval-result-failed.event";
import type { EvalRuntimePrimitives } from "../value-objects/eval-runtime.value-object";
import type { EvalResultErrorValue } from "../value-objects/eval-result-error.value-object";
import { EvalProviderRequest } from "../value-objects/eval-provider-request.value-object";
import type { EvalProviderRequestPrimitives } from "../value-objects/eval-provider-request.value-object";

export interface EvalResultPrimitives {
  resultId: string;
  caseId: string;
  runId: string;
  producer: string;
  createdAt: string;
  runtime?: EvalRuntimePrimitives | null;
  promptVariables?: PromptVariablesValue;
  renderedPrompt: RenderedPromptPrimitives;
  providerRequest?: EvalProviderRequestPrimitives;
  rawOutput: unknown | null;
  parsedOutput: unknown | null;
  status: EvalResultStatusValue;
  error: EvalResultErrorValue;
  usage?: unknown | null;
  latencyMs?: number | null;
}

export interface EvalResultCreateSuccessParams {
  id: ResultId;
  caseId: CaseId;
  runId: EvalRunId;
  producer: Producer;
  createdAt: Timestamp;
  runtime: EvalRuntimeNullable;
  promptVariables: PromptVariables;
  renderedPrompt: RenderedPrompt;
  providerRequest: EvalProviderRequest;
  rawOutput: EvalRawOutputNullable;
  parsedOutput: EvalParsedOutputNullable;
  usage: EvalUsageNullable;
  latencyMs: EvalLatencyMsNullable;
}

export interface EvalResultCreateFailedParams {
  id: ResultId;
  caseId: CaseId;
  runId: EvalRunId;
  producer: Producer;
  createdAt: Timestamp;
  runtime: EvalRuntimeNullable;
  promptVariables: PromptVariables;
  renderedPrompt: RenderedPrompt;
  providerRequest: EvalProviderRequest;
  error: EvalResultError;
}

export class EvalResult extends AggregateRoot {
  private constructor(
    private readonly resultIdValue: ResultId,
    private readonly caseIdValue: CaseId,
    private readonly evalRunIdValue: EvalRunId,
    private readonly producerValue: Producer,
    private readonly createdAtValue: Timestamp,
    private readonly runtimeValue: EvalRuntimeNullable,
    private readonly promptVariablesValue: PromptVariables,
    private readonly renderedPromptValue: RenderedPrompt,
    private readonly providerRequestValue: EvalProviderRequest,
    private readonly rawOutputValue: EvalRawOutputNullable,
    private readonly parsedOutputValue: EvalParsedOutputNullable,
    private readonly statusValue: EvalResultStatus,
    private readonly errorValue: EvalResultError,
    private readonly usageValue: EvalUsageNullable,
    private readonly latencyMsValue: EvalLatencyMsNullable,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalResultPrimitives): EvalResult {
    return new EvalResult(
      ResultId.fromPrimitives(primitives.resultId),
      CaseId.fromPrimitives(primitives.caseId),
      EvalRunId.fromPrimitives(primitives.runId),
      Producer.fromPrimitives(primitives.producer),
      Timestamp.fromPrimitives(primitives.createdAt),
      EvalRuntimeNullable.fromPrimitives(primitives.runtime),
      PromptVariables.fromPrimitives(primitives.promptVariables),
      RenderedPrompt.fromPrimitives(primitives.renderedPrompt),
      EvalProviderRequest.fromPrimitives(primitives.providerRequest),
      EvalRawOutputNullable.fromPrimitives(primitives.rawOutput),
      EvalParsedOutputNullable.fromPrimitives(primitives.parsedOutput),
      EvalResultStatus.fromPrimitives(primitives.status),
      EvalResultError.fromPrimitives(primitives.error),
      EvalUsageNullable.fromPrimitives(primitives.usage),
      EvalLatencyMsNullable.fromPrimitives(primitives.latencyMs),
    );
  }

  static createSuccess(input: EvalResultCreateSuccessParams): EvalResult {
    const evalResult = new EvalResult(
      input.id,
      input.caseId,
      input.runId,
      input.producer,
      input.createdAt,
      input.runtime,
      input.promptVariables,
      input.renderedPrompt,
      input.providerRequest,
      input.rawOutput,
      input.parsedOutput,
      EvalResultStatus.completed(),
      EvalResultError.none(),
      input.usage,
      input.latencyMs,
    );
    evalResult.recordDomainEvent(new EvalResultCompletedEvent(evalResult.toPrimitives()));
    return evalResult;
  }

  static createFailed(input: EvalResultCreateFailedParams): EvalResult {
    const evalResult = new EvalResult(
      input.id,
      input.caseId,
      input.runId,
      input.producer,
      input.createdAt,
      input.runtime,
      input.promptVariables,
      input.renderedPrompt,
      input.providerRequest,
      EvalRawOutputNullable.empty(),
      EvalParsedOutputNullable.empty(),
      EvalResultStatus.failed(),
      input.error,
      EvalUsageNullable.empty(),
      EvalLatencyMsNullable.empty(),
    );
    evalResult.recordDomainEvent(new EvalResultFailedEvent(evalResult.toPrimitives()));
    return evalResult;
  }

  get id(): ResultId {
    return this.resultIdValue;
  }

  toPrimitives(): EvalResultPrimitives {
    return {
      resultId: this.resultIdValue.toPrimitives(),
      caseId: this.caseIdValue.toPrimitives(),
      runId: this.evalRunIdValue.toPrimitives(),
      producer: this.producerValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
      runtime: this.runtimeValue.toPrimitives(),
      promptVariables: this.promptVariablesValue.toPrimitives(),
      renderedPrompt: this.renderedPromptValue.toPrimitives(),
      providerRequest: this.providerRequestValue.toPrimitives(),
      rawOutput: this.rawOutputValue.toPrimitives(),
      parsedOutput: this.parsedOutputValue.toPrimitives(),
      status: this.statusValue.toPrimitives(),
      error: this.errorValue.toPrimitives(),
      usage: this.usageValue.toPrimitives(),
      latencyMs: this.latencyMsValue.toPrimitives(),
    };
  }
}
