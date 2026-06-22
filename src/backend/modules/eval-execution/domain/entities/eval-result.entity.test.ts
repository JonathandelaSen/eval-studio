import { describe, expect, it } from "vitest";
import { EvalResult } from "./eval-result.entity";

describe("EvalResult", () => {
  it("hydrates identities and round-trips primitives", () => {
    const result = EvalResult.fromPrimitives({
      schemaVersion: "1",
      resultId: "result-1",
      caseId: "case-1",
      runId: "run-1",
      producer: "eval-studio",
      createdAt: "2026-06-22T00:00:00.000Z",
      renderedPrompt: { format: "messages", messages: [] },
      rawOutput: null,
      parsedOutput: null,
      status: "failed",
      error: { message: "Nope" },
    });

    expect(result.toPrimitives().resultId).toBe("result-1");
    expect(result.toPrimitives().status).toBe("failed");
  });
});
