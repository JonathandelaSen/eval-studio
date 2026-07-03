import type { EvalCase } from "@/backend/modules/eval-workspace";

export type CreateCaseResponse = EvalCase;
export const toCreateCaseResponse = (value: EvalCase): CreateCaseResponse => ({ ...value });
