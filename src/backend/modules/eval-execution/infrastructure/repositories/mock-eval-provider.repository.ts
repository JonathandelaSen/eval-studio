import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import type {
  EvalProviderExecutionInput,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";

export class MockEvalProviderRepository implements EvalProviderRepository {
  async execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    const started = Date.now();
    const rawOutput = JSON.stringify(
      {
        provider: "mock",
        model: input.model,
        message: "Deterministic mock output from Eval Studio.",
        score: 3,
      },
      null,
      2,
    );

    return EvalPromptExecution.fromPrimitives({
      rawOutput,
      parsedOutput: JSON.parse(rawOutput),
      usage: {
        inputTokens: null,
        outputTokens: null,
        costUsd: null,
      },
      latencyMs: Date.now() - started,
    });
  }
}
