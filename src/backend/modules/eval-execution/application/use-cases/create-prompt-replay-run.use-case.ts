import { EvalResult } from "../../domain/entities/eval-result.entity";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import type { EvalCase, EvalRunPrimitives } from "../../../eval-workspace";
import type {
  EvalProvider,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

export type CreatePromptReplayRunInput = {
  name: string;
  actionId: string;
  caseIds: string[];
  cases: EvalCase[];
  provider: EvalProvider;
  model: string;
  temperature?: number;
};

export class CreatePromptReplayRunUseCase {
  constructor(
    private readonly deps: {
      providerRepository: EvalProviderRepository;
      runRepository: EvalRunRepository;
    },
  ) {}

  async execute(input: CreatePromptReplayRunInput): Promise<EvalRun> {
    const createdAt = new Date().toISOString();
    const runId = `${createdAt.replace(/[-:]/g, "").replace(/\.\d{3}/, "")}.eval-studio-${input.provider}-${this.slug(input.model)}`;
    const cases = input.cases.filter((testCase) =>
      input.caseIds.includes(testCase.caseId),
    );
    const runPrimitives: EvalRunPrimitives = {
      schemaVersion: "1",
      runId,
      name: input.name,
      actionId: input.actionId,
      producer: "eval-studio",
      createdAt,
      caseIds: cases.map((testCase) => testCase.caseId),
      runtime: {
        provider: input.provider,
        model: input.model,
        temperature: input.temperature,
      },
      executionMode: "prompt_replay",
    };
    const run = EvalRun.fromPrimitives(runPrimitives);

    await this.deps.runRepository.save(run);

    for (const testCase of cases) {
      const resultId = `${runId}.${this.slug(testCase.caseId)}`;
      try {
        const output = (
          await this.deps.providerRepository.execute({
          provider: input.provider,
          model: input.model,
          renderedPrompt: testCase.renderedPrompt,
          temperature: input.temperature,
          })
        ).toPrimitives();
        await this.deps.runRepository.saveResult(EvalResult.fromPrimitives({
          schemaVersion: "1",
          resultId,
          caseId: testCase.caseId,
          runId,
          producer: "eval-studio",
          createdAt: new Date().toISOString(),
          runtime: runPrimitives.runtime,
          promptVariables: testCase.promptVariables,
          renderedPrompt: testCase.renderedPrompt,
          rawOutput: output.rawOutput,
          parsedOutput: output.parsedOutput,
          status: "completed",
          error: null,
          usage: output.usage,
          latencyMs: output.latencyMs,
        }));
      } catch (error) {
        await this.deps.runRepository.saveResult(EvalResult.fromPrimitives({
          schemaVersion: "1",
          resultId,
          caseId: testCase.caseId,
          runId,
          producer: "eval-studio",
          createdAt: new Date().toISOString(),
          runtime: runPrimitives.runtime,
          promptVariables: testCase.promptVariables,
          renderedPrompt: testCase.renderedPrompt,
          rawOutput: null,
          parsedOutput: null,
          status: "failed",
          error: {
            message:
              error instanceof Error ? error.message : "Provider request failed.",
            code: "provider_error",
          },
          usage: null,
          latencyMs: null,
        }));
      }
    }

    return run;
  }

  private slug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 80);
  }
}
