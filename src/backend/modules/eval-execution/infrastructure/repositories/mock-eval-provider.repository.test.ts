import { describe, expect, it } from "vitest";
import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import { EvalProvider } from "../../domain/value-objects/eval-provider.value-object";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { RenderedPrompt } from "../../domain/value-objects/rendered-prompt.value-object";
import { MockEvalProviderRepository } from "./mock-eval-provider.repository";

describe("MockEvalProviderRepository", () => {
  it("returns a prompt execution entity", async () => {
    const result = await new MockEvalProviderRepository().execute({
      provider: EvalProvider.fromPrimitives("mock"),
      model: EvalModel.fromPrimitives("mock-model"),
      renderedPrompt: RenderedPrompt.fromPrimitives({ format: "messages", messages: [] }),
    });

    expect(result).toBeInstanceOf(EvalPromptExecution);
    expect(result.toPrimitives().rawOutput).toContain("mock");
  });
});
