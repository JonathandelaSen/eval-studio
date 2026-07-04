import { describe, expect, it, vi } from "vitest";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { EvalProvider } from "../../domain/value-objects/eval-provider.value-object";
import { RenderedPrompt } from "../../domain/value-objects/rendered-prompt.value-object";
import { OllamaEvalProviderRepository } from "./ollama-eval-provider.repository";

describe("OllamaEvalProviderRepository", () => {
  it("discovers locally installed models", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      models: [{ name: "llama3.2:latest", digest: "sha256:abc" }],
    })));
    const provider = new OllamaEvalProviderRepository({
      baseUrl: "http://localhost:11434",
      fetcher,
    });

    await expect(provider.listModels()).resolves.toEqual([
      { id: "llama3.2:latest", label: "llama3.2:latest", digest: "sha256:abc" },
    ]);
  });

  it("executes a messages prompt through the chat API", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      model: "llama3.2:latest",
      message: { content: "Local answer" },
      prompt_eval_count: 12,
      eval_count: 5,
      total_duration: 2_000_000,
    })));
    const provider = new OllamaEvalProviderRepository({
      baseUrl: "http://localhost:11434/",
      fetcher,
    });

    const output = await provider.execute({
      provider: EvalProvider.ollama(),
      model: EvalModel.fromPrimitives("llama3.2:latest"),
      renderedPrompt: RenderedPrompt.fromPrimitives({
        format: "messages",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    expect(output.toPrimitives()).toMatchObject({
      rawOutput: "Local answer",
      parsedOutput: "Local answer",
      usage: { inputTokens: 12, outputTokens: 5 },
    });
    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:11434/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetcher.mock.calls[0]?.[1]).toEqual({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
      }),
    });
  });
});
