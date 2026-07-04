import { Timestamp, type EventBus } from "@/backend/modules/shared";
import type { EvalCase } from "../../../eval-workspace";
import { EvalResult } from "../../domain/entities/eval-result.entity";
import type { EvalRun } from "../../domain/entities/eval-run.entity";
import type { EvalProviderRepository } from "../../domain/repositories/eval-provider.repository";
import type { EvalResultRepository } from "../../domain/repositories/eval-result.repository";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import { EvalLatencyMsNullable } from "../../domain/value-objects/eval-latency-ms-nullable.value-object";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { EvalParsedOutputNullable } from "../../domain/value-objects/eval-parsed-output-nullable.value-object";
import { EvalProvider } from "../../domain/value-objects/eval-provider.value-object";
import { EvalRawOutputNullable } from "../../domain/value-objects/eval-raw-output-nullable.value-object";
import { EvalResultError } from "../../domain/value-objects/eval-result-error.value-object";
import { EvalRuntimeNullable } from "../../domain/value-objects/eval-runtime-nullable.value-object";
import { EvalRuntime } from "../../domain/value-objects/eval-runtime.value-object";
import { EvalTemperatureNullable } from "../../domain/value-objects/eval-temperature-nullable.value-object";
import { EvalUsageNullable } from "../../domain/value-objects/eval-usage-nullable.value-object";
import { Producer } from "../../domain/value-objects/producer.value-object";
import { PromptVariables } from "../../domain/value-objects/prompt-variables.value-object";
import { RenderedPrompt } from "../../domain/value-objects/rendered-prompt.value-object";
import { ResultId } from "../../domain/value-objects/result-id.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";

export class ExecuteRunUseCase {
  constructor(
    private readonly deps: {
      providerRepository: EvalProviderRepository;
      runRepository: EvalRunRepository;
      resultRepository: EvalResultRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: { workspaceRoot?: string; run: EvalRun; cases: EvalCase[] }): Promise<EvalRun> {
    const root = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const runPrimitives = input.run.toPrimitives();
    const runtime = runPrimitives.runtime;
    if (!runtime) throw new Error("Run runtime is required.");
    input.run.markRunning();
    await this.deps.runRepository.save(root, input.run);
    let hasFailures = false;
    const selected = new Set(runPrimitives.caseIds);

    for (const testCase of input.cases.filter((item) => selected.has(item.caseId))) {
      const provider = EvalProvider.fromPrimitives(runtime.provider);
      const model = EvalModel.fromPrimitives(runtime.model);
      const temperature = EvalTemperatureNullable.fromPrimitives(runtime.temperature);
      const renderedPrompt = RenderedPrompt.fromPrimitives(testCase.renderedPrompt);
      const executionInput = {
        provider,
        model,
        renderedPrompt,
        temperature: temperature.valueValue ?? undefined,
      };
      const providerRequest = this.deps.providerRepository.prepare(executionInput);
      const base = {
        id: ResultId.create({ evalRunId: input.run.id, caseId: CaseId.fromPrimitives(testCase.caseId) }),
        caseId: CaseId.fromPrimitives(testCase.caseId),
        runId: input.run.id,
        producer: Producer.evalStudio(),
        runtime: EvalRuntimeNullable.fromPrimitives(runtime),
        promptVariables: PromptVariables.fromPrimitives(testCase.promptVariables),
        renderedPrompt,
        providerRequest,
      };
      let result: EvalResult;
      try {
        const output = (await this.deps.providerRepository.execute(
          executionInput,
          providerRequest,
        )).toPrimitives();
        const effective = output.effectiveRuntime;
        result = EvalResult.createSuccess({
          ...base,
          runtime: EvalRuntimeNullable.fromValue(EvalRuntime.create({
            provider,
            model: EvalModel.fromPrimitives(effective?.model ?? model.toPrimitives()),
            temperature,
            modelDigest: effective?.modelDigest,
            systemVersion: effective?.systemVersion,
          })),
          createdAt: Timestamp.now(),
          rawOutput: EvalRawOutputNullable.fromPrimitives(output.rawOutput),
          parsedOutput: EvalParsedOutputNullable.fromPrimitives(output.parsedOutput),
          usage: EvalUsageNullable.fromPrimitives(output.usage),
          latencyMs: EvalLatencyMsNullable.fromPrimitives(output.latencyMs),
        });
      } catch (error) {
        hasFailures = true;
        result = EvalResult.createFailed({
          ...base,
          createdAt: Timestamp.now(),
          error: EvalResultError.providerError(error instanceof Error ? error.message : undefined),
        });
      }
      await this.deps.resultRepository.save(root, result);
      await this.deps.eventBus.publish(result.pullDomainEvents());
    }
    input.run.markCompleted(hasFailures);
    await this.deps.runRepository.save(root, input.run);
    return input.run;
  }
}
