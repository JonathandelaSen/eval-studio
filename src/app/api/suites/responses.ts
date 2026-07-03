import type { EvalSuite } from "@/backend/modules/eval-workspace";

export type CreateSuiteResponse = EvalSuite;
export const toCreateSuiteResponse = (suite: EvalSuite): CreateSuiteResponse => ({ ...suite });
