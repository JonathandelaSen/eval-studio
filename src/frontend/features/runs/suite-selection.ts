export function nextSuiteIdAfterDelete(
  suites: ReadonlyArray<{ suiteId: string }>,
  deletedSuiteId: string,
): string | null {
  return suites.find((suite) => suite.suiteId !== deletedSuiteId)?.suiteId ?? null;
}
