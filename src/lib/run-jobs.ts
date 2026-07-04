const globalJobs = globalThis as typeof globalThis & {
  evalStudioRunJobs?: Map<string, Promise<unknown>>;
  evalStudioRunQueueTail?: Promise<unknown>;
};

const jobs = globalJobs.evalStudioRunJobs ?? new Map<string, Promise<unknown>>();
globalJobs.evalStudioRunJobs = jobs;

export function startRunJob(runId: string, task: () => Promise<unknown>): void {
  if (jobs.has(runId)) return;
  const tail = globalJobs.evalStudioRunQueueTail ?? Promise.resolve();
  const promise = tail.then(() => task()).finally(() => jobs.delete(runId));
  globalJobs.evalStudioRunQueueTail = promise.catch(() => undefined);
  jobs.set(runId, promise);
}

export function isRunJobActive(runId: string): boolean {
  return jobs.has(runId);
}
