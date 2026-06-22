import { EvalPromptExecution } from "../entities/eval-prompt-execution.entity";
import { EvalProvider } from "../value-objects/eval-provider.value-object";
import { EvalModel } from "../value-objects/eval-model.value-object";
import { EvalTemperature } from "../value-objects/eval-temperature.value-object";
import { RenderedPrompt } from "../value-objects/rendered-prompt.value-object";

export interface EvalProviderExecutionInput {
  provider: EvalProvider;
  model: EvalModel;
  renderedPrompt: RenderedPrompt;
  temperature?: EvalTemperature;
}

export interface EvalProviderRepository {
  execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution>;
}
