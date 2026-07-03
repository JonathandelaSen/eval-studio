import type { EvalCase } from "@/backend/modules/eval-workspace";

export type UpdateCaseResponse = EvalCase;

export interface DeleteCaseResponse {
  caseId: string;
}

export function toUpdateCaseResponse(evalCase: EvalCase): UpdateCaseResponse {
  return { ...evalCase };
}

export function toDeleteCaseResponse(caseId: string): DeleteCaseResponse {
  return { caseId };
}
