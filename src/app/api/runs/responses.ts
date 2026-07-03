import type { EvalRunPrimitives } from "@/backend/modules/eval-execution";

export type CreateRunResponse = EvalRunPrimitives;

export function toCreateRunResponse(run: EvalRunPrimitives): CreateRunResponse {
  return { ...run, caseIds: [...run.caseIds] };
}
