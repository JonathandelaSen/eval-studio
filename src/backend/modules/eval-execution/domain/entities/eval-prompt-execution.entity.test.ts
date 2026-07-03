import { describe, expect, it } from "vitest";
import { EvalPromptExecution } from "./eval-prompt-execution.entity";

describe("EvalPromptExecution", () => {
  it("round-trips provider execution output", () => {
    const execution = EvalPromptExecution.fromPrimitives({
      rawOutput: "{}",
      parsedOutput: {},
      usage: null,
      latencyMs: 12,
      effectiveRuntime: { model: "llama3:latest", modelDigest: "sha256:abc" },
    });

    expect(execution.toPrimitives().latencyMs).toBe(12);
    expect(execution.toPrimitives().effectiveRuntime).toEqual({
      model: "llama3:latest",
      modelDigest: "sha256:abc",
    });
  });

  it("rejects negative latency", () => {
    expect(() =>
      EvalPromptExecution.fromPrimitives({
        rawOutput: "{}",
        parsedOutput: {},
        usage: null,
        latencyMs: -1,
      }),
    ).toThrow();
  });
});
