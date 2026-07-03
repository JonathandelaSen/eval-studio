import type { EvalRunPrimitives } from "@/backend/modules/eval-execution";

export type UpdateRunResponse = EvalRunPrimitives;

export interface DeleteRunResponse {
  runId: string;
}

export function toUpdateRunResponse(run: EvalRunPrimitives): UpdateRunResponse {
  return { ...run, caseIds: [...run.caseIds] };
}

export function toDeleteRunResponse(runId: string): DeleteRunResponse {
  return { runId };
}
