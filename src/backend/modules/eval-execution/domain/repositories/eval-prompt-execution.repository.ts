import { EvalPromptExecution } from "../entities/eval-prompt-execution.entity";

export interface EvalPromptExecutionRepository {
  save(execution: EvalPromptExecution): Promise<EvalPromptExecution>;
}
