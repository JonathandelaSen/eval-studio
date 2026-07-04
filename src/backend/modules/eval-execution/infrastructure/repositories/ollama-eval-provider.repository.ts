import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import type {
  EvalProviderExecutionInput,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";
import { EvalProviderRequest } from "../../domain/value-objects/eval-provider-request.value-object";

type FetcherInput = typeof fetch;

export class OllamaEvalProviderRepository implements EvalProviderRepository {
  private readonly baseUrl: string;
  private readonly fetcher: FetcherInput;

  constructor(input?: { baseUrl?: string; fetcher?: FetcherInput }) {
    this.baseUrl = (input?.baseUrl ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434")
      .replace(/\/$/, "");
    this.fetcher = input?.fetcher ?? fetch;
  }

  async listModels(): Promise<Array<{ id: string; label: string; digest?: string }>> {
    const response = await this.fetcher(`${this.baseUrl}/api/tags`);
    if (!response.ok) throw new Error(`Ollama returned ${response.status}.`);
    const data = await response.json() as { models?: Array<{ name?: string; digest?: string }> };
    return (data.models ?? [])
      .filter((model): model is { name: string; digest?: string } => Boolean(model.name))
      .map((model) => ({ id: model.name, label: model.name, ...(model.digest ? { digest: model.digest } : {}) }));
  }

  prepare(input: EvalProviderExecutionInput): EvalProviderRequest {
    const prompt = input.renderedPrompt.toPrimitives();
    const messages = this.messages(prompt);
    return EvalProviderRequest.fromPrimitives({
      transport: "http",
      target: `${this.baseUrl}/api/chat`,
      contentType: "application/json",
      body: {
        model: input.model.toPrimitives(),
        messages,
        stream: false,
        ...(input.temperature
          ? { options: { temperature: input.temperature.toPrimitives() } }
          : {}),
      },
    });
  }

  async execute(
    input: EvalProviderExecutionInput,
    request = this.prepare(input),
  ): Promise<EvalPromptExecution> {
    const prepared = request.toPrimitives();
    if (!prepared) throw new Error("Provider request is missing.");
    const started = Date.now();
    const response = await this.fetcher(prepared.target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prepared.body),
    });
    if (!response.ok) throw new Error(`Ollama returned ${response.status}.`);
    const data = await response.json() as {
      model?: string;
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
      total_duration?: number;
    };
    const content = data.message?.content;
    if (typeof content !== "string") throw new Error("Ollama returned no message content.");
    const effectiveModel = data.model ?? input.model.toPrimitives();
    const installed = await this.listModels().catch(() => []);
    const digest = installed.find((item) => item.id === effectiveModel)?.digest;
    return EvalPromptExecution.fromPrimitives({
      rawOutput: content,
      parsedOutput: this.parse(content),
      usage: {
        inputTokens: data.prompt_eval_count ?? null,
        outputTokens: data.eval_count ?? null,
        costUsd: null,
      },
      latencyMs: data.total_duration
        ? Math.round(data.total_duration / 1_000_000)
        : Date.now() - started,
      effectiveRuntime: {
        model: effectiveModel,
        ...(digest ? { modelDigest: digest } : {}),
      },
    });
  }

  private messages(prompt: Record<string, unknown>): Array<{ role: string; content: string }> {
    if (prompt.format === "text" && typeof prompt.text === "string") {
      return [{ role: "user", content: prompt.text }];
    }
    if (!Array.isArray(prompt.messages)) throw new Error("Messages prompt is invalid.");
    return prompt.messages.map((value) => {
      if (!value || typeof value !== "object") throw new Error("Prompt message is invalid.");
      const message = value as Record<string, unknown>;
      if (typeof message.role !== "string" || typeof message.content !== "string") {
        throw new Error("Prompt message is invalid.");
      }
      return { role: message.role, content: message.content };
    });
  }

  private parse(content: string): unknown {
    try { return JSON.parse(content); } catch { return content; }
  }
}
