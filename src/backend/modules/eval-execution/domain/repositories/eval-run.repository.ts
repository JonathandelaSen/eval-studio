import { EvalResult } from "../entities/eval-result.entity";
import { EvalRun } from "../entities/eval-run.entity";

export interface EvalRunRepository {
  save(run: EvalRun): Promise<EvalRun>;
  saveResult(result: EvalResult): Promise<EvalResult>;
}
