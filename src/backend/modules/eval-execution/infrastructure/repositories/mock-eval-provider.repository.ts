import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import type {
  EvalProviderExecutionInput,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";
import { EvalProviderRequest } from "../../domain/value-objects/eval-provider-request.value-object";

export class MockEvalProviderRepository implements EvalProviderRepository {
  prepare(input: EvalProviderExecutionInput): EvalProviderRequest {
    return EvalProviderRequest.fromPrimitives({
      transport: "in-memory",
      target: "mock",
      contentType: "application/json",
      body: {
        model: input.model.toPrimitives(),
        prompt: input.renderedPrompt.toPrimitives(),
        ...(input.temperature
          ? { temperature: input.temperature.toPrimitives() }
          : {}),
      },
    });
  }

  async execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    const started = Date.now();
    const rawOutput = JSON.stringify(
      {
        provider: "mock",
        model: input.model.toPrimitives(),
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
