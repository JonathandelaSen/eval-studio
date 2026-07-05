export function suitePath(suiteId: string): string {
  return `/suites/${suiteId}`;
}

export function suiteCasesPath(suiteId: string): string {
  return `/suites/${suiteId}/cases`;
}

export function casePath(suiteId: string, caseId: string): string {
  return `/suites/${suiteId}/cases/${caseId}`;
}

export function caseRunsPath(suiteId: string, caseId: string): string {
  return `/suites/${suiteId}/cases/${caseId}/runs`;
}

export function runPath(suiteId: string, caseId: string, runId: string): string {
  return `/suites/${suiteId}/cases/${caseId}/runs/${runId}`;
}

export function resultPath(
  suiteId: string,
  caseId: string,
  runId: string,
  resultId: string,
): string {
  return `/suites/${suiteId}/cases/${caseId}/runs/${runId}/results/${resultId}`;
}

export function suiteStatsPath(suiteId: string): string {
  return `/suites/${suiteId}/stats`;
}

export function suiteFilesPath(suiteId: string): string {
  return `/suites/${suiteId}/files`;
}
