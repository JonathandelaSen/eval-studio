import { describe, expect, it } from "vitest";
import { parseRunId, parseUpdateRunRequest } from "./validation";

describe("parseRunId", () => {
  it("accepts a run id", () => {
    const parsed = parseRunId("20260701T000000Z.eval-studio-mock-model");
    expect(parsed).toEqual({
      ok: true,
      value: { runId: "20260701T000000Z.eval-studio-mock-model" },
    });
  });

  it("rejects path traversal and empty values", () => {
    expect(parseRunId("..").ok).toBe(false);
    expect(parseRunId("runs/../..").ok).toBe(false);
    expect(parseRunId("").ok).toBe(false);
    expect(parseRunId(42).ok).toBe(false);
  });
});

describe("parseUpdateRunRequest", () => {
  it("accepts a rename", () => {
    const parsed = parseUpdateRunRequest({ name: "Baseline v2" });
    expect(parsed).toEqual({ ok: true, value: { name: "Baseline v2" } });
  });

  it("accepts clearing notes with null", () => {
    const parsed = parseUpdateRunRequest({ notes: null });
    expect(parsed).toEqual({ ok: true, value: { notes: null } });
  });

  it("rejects an empty update", () => {
    expect(parseUpdateRunRequest({}).ok).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(parseUpdateRunRequest({ name: "   " }).ok).toBe(false);
  });
});
