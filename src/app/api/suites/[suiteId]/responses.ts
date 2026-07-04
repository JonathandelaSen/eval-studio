export interface DeleteSuiteResponse {
  suiteId: string;
}

export function toDeleteSuiteResponse(suiteId: string): DeleteSuiteResponse {
  return { suiteId };
}
