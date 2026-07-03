import { describe, expect, it } from "vitest";
import { EvalCase } from "./eval-case.entity";
import type { EvalCasePrimitives } from "./eval-workspace.entity";

const casePrimitives: EvalCasePrimitives = {
  caseId: "550e8400-e29b-41d4-a716-446655440001",
  actionId: "550e8400-e29b-41d4-a716-446655440000",
  name: "Summarize invoice",
  note: "Focus on totals",
  createdAt: "2026-07-01T00:00:00.000Z",
  input: { document: "invoice.pdf" },
  renderedPrompt: { format: "text", text: "Summarize this invoice." },
};

describe("EvalCase", () => {
  it("round-trips primitives", () => {
    const evalCase = EvalCase.fromPrimitives(casePrimitives);

    expect(evalCase.id.toPrimitives()).toBe(casePrimitives.caseId);
    expect(evalCase.toPrimitives()).toEqual(casePrimitives);
  });

  it("trims the case name", () => {
    const evalCase = EvalCase.fromPrimitives({
      ...casePrimitives,
      name: "  Summarize invoice  ",
    });

    expect(evalCase.toPrimitives().name).toBe("Summarize invoice");
  });

  it("rejects an empty name", () => {
    expect(() =>
      EvalCase.fromPrimitives({ ...casePrimitives, name: " " }),
    ).toThrow("Case name cannot be empty.");
  });

  it("rejects an invalid case id", () => {
    expect(() =>
      EvalCase.fromPrimitives({ ...casePrimitives, caseId: "not-a-uuid" }),
    ).toThrow();
  });
});
