import { Timestamp, type EventBus } from "@/backend/modules/shared";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalResult } from "../../domain/entities/eval-result.entity";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import { ActionId } from "../../domain/value-objects/action-id.value-object";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import { CaseIds } from "../../domain/value-objects/case-ids.value-object";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { EvalProvider, type EvalProviderPrimitives } from "../../domain/value-objects/eval-provider.value-object";
import { Producer } from "../../domain/value-objects/producer.value-object";
import { ResultId } from "../../domain/value-objects/result-id.value-object";
import { EvalRunId } from "../../domain/value-objects/eval-run-id.value-object";
import { RunName } from "../../domain/value-objects/run-name.value-object";
import { EvalTemperatureNullable } from "../../domain/value-objects/eval-temperature-nullable.value-object";
import { EvalRuntime } from "../../domain/value-objects/eval-runtime.value-object";
import { EvalRuntimeNullable } from "../../domain/value-objects/eval-runtime-nullable.value-object";
import { RunNotesNullable } from "../../domain/value-objects/run-notes-nullable.value-object";
import { SuiteIdNullable } from "../../domain/value-objects/suite-id-nullable.value-object";
import { RenderedPrompt } from "../../domain/value-objects/rendered-prompt.value-object";
import { PromptVariables } from "../../domain/value-objects/prompt-variables.value-object";
import { EvalRawOutputNullable } from "../../domain/value-objects/eval-raw-output-nullable.value-object";
import { EvalParsedOutputNullable } from "../../domain/value-objects/eval-parsed-output-nullable.value-object";
import { EvalResultError } from "../../domain/value-objects/eval-result-error.value-object";
import { EvalUsageNullable } from "../../domain/value-objects/eval-usage-nullable.value-object";
import { EvalLatencyMsNullable } from "../../domain/value-objects/eval-latency-ms-nullable.value-object";
import type { EvalCase } from "../../../eval-workspace";
import type {
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";
import type { EvalResultRepository } from "../../domain/repositories/eval-result.repository";

export type CreateRunInput = {
  workspaceRoot?: string;
  name: string;
  actionId: string;
  caseIds: string[];
  cases: EvalCase[];
  provider: EvalProviderPrimitives;
  model: string;
  temperature?: number;
};

export class CreateRunUseCase {
  constructor(
    private readonly deps: {
      providerRepository: EvalProviderRepository;
      runRepository: EvalRunRepository;
      resultRepository: EvalResultRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: CreateRunInput): Promise<EvalRun> {
    const context = this.buildContext(input);
    const evalRun = await this.createRun(input, context);
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;

    for (const testCase of context.cases) {
      const evalResult = await this.runCase(testCase, evalRun, context);
      await this.deps.resultRepository.save(workspaceRoot, evalResult);
      await this.deps.eventBus.publish(evalResult.pullDomainEvents());
    }

    return evalRun;
  }

  private buildContext(input: CreateRunInput): RunContext {
    const createdAt = Timestamp.now();
    const producer = Producer.evalStudio();
    const selectedCaseIds = new Set(input.caseIds);
    const cases = input.cases.filter((testCase) => selectedCaseIds.has(testCase.caseId));
    const provider = EvalProvider.fromPrimitives(input.provider);
    const model = EvalModel.fromPrimitives(input.model);
    const temperature = EvalTemperatureNullable.fromPrimitives(input.temperature);
    const runtime = EvalRuntimeNullable.fromValue(
      EvalRuntime.create({ provider, model, temperature }),
    );

    return { createdAt, producer, cases, provider, model, temperature, runtime };
  }

  private async createRun(input: CreateRunInput, context: RunContext): Promise<EvalRun> {
    const { createdAt, producer, cases, provider, model, runtime } = context;
    const evalRun = EvalRun.create({
      id: EvalRunId.create({ createdAt, producer, provider, model }),
      name: RunName.fromPrimitives(input.name),
      actionId: ActionId.fromPrimitives(input.actionId),
      producer,
      createdAt,
      caseIds: CaseIds.fromPrimitives(cases.map((testCase) => testCase.caseId)),
      runtime,
      notes: RunNotesNullable.empty(),
      suiteId: SuiteIdNullable.empty(),
    });

    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;

    await this.deps.runRepository.save(workspaceRoot, evalRun);
    await this.deps.eventBus.publish(evalRun.pullDomainEvents());

    return evalRun;
  }

  private async runCase(
    testCase: EvalCase,
    evalRun: EvalRun,
    context: RunContext,
  ): Promise<EvalResult> {
    const { producer, provider, model, temperature, runtime } = context;
    const caseId = CaseId.fromPrimitives(testCase.caseId);
    const resultId = ResultId.create({ evalRunId: evalRun.id, caseId });
    const promptVariables = PromptVariables.fromPrimitives(testCase.promptVariables);
    const renderedPrompt = RenderedPrompt.fromPrimitives(testCase.renderedPrompt);
    const base = {
      id: resultId,
      caseId,
      runId: evalRun.id,
      producer,
      runtime,
      promptVariables,
      renderedPrompt,
    };

    try {
      const output = (
        await this.deps.providerRepository.execute({
          provider,
          model,
          renderedPrompt,
          temperature: temperature.valueValue ?? undefined,
        })
      ).toPrimitives();
      return EvalResult.createSuccess({
        ...base,
        createdAt: Timestamp.now(),
        rawOutput: EvalRawOutputNullable.fromPrimitives(output.rawOutput),
        parsedOutput: EvalParsedOutputNullable.fromPrimitives(output.parsedOutput),
        usage: EvalUsageNullable.fromPrimitives(output.usage),
        latencyMs: EvalLatencyMsNullable.fromPrimitives(output.latencyMs),
      });
    } catch (error) {
      return EvalResult.createFailed({
        ...base,
        createdAt: Timestamp.now(),
        error: EvalResultError.providerError(
          error instanceof Error ? error.message : undefined,
        ),
      });
    }
  }
}

type RunContext = {
  createdAt: Timestamp;
  producer: Producer;
  cases: EvalCase[];
  provider: EvalProvider;
  model: EvalModel;
  temperature: EvalTemperatureNullable;
  runtime: ReturnType<typeof EvalRuntimeNullable.fromValue>;
};
