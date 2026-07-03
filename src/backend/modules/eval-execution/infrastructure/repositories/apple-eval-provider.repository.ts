import { spawn } from "node:child_process";
import path from "node:path";
import { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import type {
  EvalProviderExecutionInput,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";

type HelperPayloadRow = {
  mode: "availability" | "execute";
  instructions?: string;
  prompt?: string;
  temperature?: number;
};
type HelperResponseRow = {
  available?: boolean;
  reason?: string;
  model?: string;
  systemVersion?: string;
  output?: string;
};
type RunHelperRow = (payload: HelperPayloadRow) => Promise<HelperResponseRow>;

export class AppleEvalProviderRepository implements EvalProviderRepository {
  private readonly runHelper: RunHelperRow;

  constructor(input?: { runHelper?: RunHelperRow }) {
    this.runHelper = input?.runHelper ?? runBundledHelper;
  }

  availability(): Promise<HelperResponseRow> {
    return this.runHelper({ mode: "availability" });
  }

  async execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    const { instructions, prompt } = this.promptParts(input.renderedPrompt.toPrimitives());
    const started = Date.now();
    const response = await this.runHelper({
      mode: "execute",
      instructions,
      prompt,
      ...(input.temperature ? { temperature: input.temperature.toPrimitives() } : {}),
    });
    if (typeof response.output !== "string") {
      throw new Error(response.reason ?? "Apple system model returned no output.");
    }
    return EvalPromptExecution.fromPrimitives({
      rawOutput: response.output,
      parsedOutput: this.parse(response.output),
      usage: null,
      latencyMs: Date.now() - started,
      effectiveRuntime: {
        model: response.model ?? input.model.toPrimitives(),
        ...(response.systemVersion ? { systemVersion: response.systemVersion } : {}),
      },
    });
  }

  private promptParts(value: Record<string, unknown>): { instructions: string; prompt: string } {
    if (value.format === "text" && typeof value.text === "string") {
      return { instructions: "", prompt: value.text };
    }
    if (!Array.isArray(value.messages)) throw new Error("Messages prompt is invalid.");
    const messages = value.messages.map((entry) => entry as Record<string, unknown>);
    const instructions = messages
      .filter((entry) => entry.role === "system" && typeof entry.content === "string")
      .map((entry) => entry.content as string)
      .join("\n\n");
    const prompt = messages
      .filter((entry) => entry.role !== "system" && typeof entry.content === "string")
      .map((entry) => entry.content as string)
      .join("\n\n");
    if (!prompt) throw new Error("Apple system model requires a user prompt.");
    return { instructions, prompt };
  }

  private parse(value: string): unknown {
    try { return JSON.parse(value); } catch { return value; }
  }
}

async function runBundledHelper(payload: HelperPayloadRow): Promise<HelperResponseRow> {
  const script = path.join(process.cwd(), "scripts", "apple-foundation-model.swift");
  return new Promise((resolve, reject) => {
    const child = spawn("xcrun", ["swift", script], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += String(chunk); });
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr.trim() || "Apple helper failed."));
      try { resolve(JSON.parse(stdout) as HelperResponseRow); }
      catch { reject(new Error("Apple helper returned invalid JSON.")); }
    });
    child.stdin.end(JSON.stringify(payload));
  });
}
