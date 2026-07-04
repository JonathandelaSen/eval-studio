import { describe, expect, it } from "vitest";
import { parseCaseId, parseUpdateCaseRequest } from "./validation";

const caseId = "550e8400-e29b-41d4-a716-446655440001";

describe("parseCaseId", () => {
  it("accepts a uuid", () => {
    expect(parseCaseId(caseId)).toEqual({ ok: true, value: { caseId } });
  });

  it("rejects non-uuid values", () => {
    expect(parseCaseId("not-a-uuid").ok).toBe(false);
    expect(parseCaseId("..").ok).toBe(false);
    expect(parseCaseId(undefined).ok).toBe(false);
  });
});

describe("parseUpdateCaseRequest", () => {
  it("accepts a rename", () => {
    const parsed = parseUpdateCaseRequest({ name: "Summarize refund" });
    expect(parsed).toEqual({ ok: true, value: { name: "Summarize refund" } });
  });

  it("accepts clearing the note with null", () => {
    const parsed = parseUpdateCaseRequest({ note: null });
    expect(parsed).toEqual({ ok: true, value: { note: null } });
  });

  it("accepts legacy input updates and free-text expected output", () => {
    expect(parseUpdateCaseRequest({ input: { invoiceId: "inv-2" } })).toEqual({
      ok: true,
      value: { input: { invoiceId: "inv-2" } },
    });
    expect(parseUpdateCaseRequest({ expectedOutput: "The invoice is valid." })).toEqual({
      ok: true,
      value: { expectedOutput: "The invoice is valid." },
    });
    expect(parseUpdateCaseRequest({ expectedOutput: null })).toEqual({
      ok: true,
      value: { expectedOutput: null },
    });
    expect(parseUpdateCaseRequest({ expectedOutput: { valid: true } }).ok).toBe(false);
  });

  it("rejects an empty update", () => {
    expect(parseUpdateCaseRequest({}).ok).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(parseUpdateCaseRequest({ name: " " }).ok).toBe(false);
  });
});
