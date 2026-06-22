import { describe, expect, it } from "vitest";
import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import { MockEvalProviderRepository } from "./mock-eval-provider.repository";

describe("MockEvalProviderRepository", () => {
  it("returns a prompt execution entity", async () => {
    const result = await new MockEvalProviderRepository().execute({
      provider: "mock",
      model: "mock-model",
      renderedPrompt: { format: "messages", messages: [] },
    });

    expect(result).toBeInstanceOf(EvalPromptExecution);
    expect(result.toPrimitives().rawOutput).toContain("mock");
  });
});
