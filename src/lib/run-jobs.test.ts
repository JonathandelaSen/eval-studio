import { describe, expect, it } from "vitest";
import { isRunJobActive, startRunJob } from "./run-jobs";

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("startRunJob", () => {
  it("executes jobs sequentially in enqueue order", async () => {
    const first = deferred();
    const started: string[] = [];
    startRunJob("seq-a", () => { started.push("a"); return first.promise; });
    startRunJob("seq-b", async () => { started.push("b"); });
    await flush();
    expect(started).toEqual(["a"]);
    expect(isRunJobActive("seq-b")).toBe(true);
    first.resolve();
    await flush();
    expect(started).toEqual(["a", "b"]);
    expect(isRunJobActive("seq-a")).toBe(false);
    expect(isRunJobActive("seq-b")).toBe(false);
  });

  it("continues the queue after a failed job", async () => {
    const failing = deferred();
    const started: string[] = [];
    startRunJob("fail-a", () => { started.push("a"); return failing.promise; });
    startRunJob("fail-b", async () => { started.push("b"); });
    failing.reject(new Error("provider crashed"));
    await flush();
    expect(started).toEqual(["a", "b"]);
    expect(isRunJobActive("fail-a")).toBe(false);
    expect(isRunJobActive("fail-b")).toBe(false);
  });

  it("ignores a duplicate run id while it is queued or running", async () => {
    const first = deferred();
    let executions = 0;
    startRunJob("dup-a", () => first.promise);
    startRunJob("dup-b", async () => { executions += 1; });
    startRunJob("dup-b", async () => { executions += 1; });
    first.resolve();
    await flush();
    expect(executions).toBe(1);
  });
});
