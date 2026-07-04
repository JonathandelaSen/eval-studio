export function retryCaseIds(
  sourceCaseIds: string[],
  existingResults: ReadonlyArray<{ caseId: string }>,
): string[] {
  const completed = new Set(existingResults.map((result) => result.caseId));
  const missing = sourceCaseIds.filter((caseId) => !completed.has(caseId));
  return missing.length > 0 ? missing : [...sourceCaseIds];
}
