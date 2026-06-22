import { EvalResult } from "../entities/eval-result.entity";

export interface EvalResultRepository {
  save(result: EvalResult): Promise<EvalResult>;
}
