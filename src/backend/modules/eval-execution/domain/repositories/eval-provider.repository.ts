import type { EvalCase } from "@/backend/modules/eval-workspace";
import { EvalPromptExecution } from "../entities/eval-prompt-execution.entity";

export type EvalProvider = "mock" | "openai" | "ollama";

export interface EvalProviderExecutionInput {
  provider: EvalProvider;
  model: string;
  renderedPrompt: EvalCase["renderedPrompt"];
  temperature?: number;
}

export interface EvalProviderRepository {
  execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution>;
}
