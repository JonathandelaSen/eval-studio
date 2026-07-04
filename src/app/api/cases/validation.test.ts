import { describe, expect, it } from "vitest";
import { createCaseRequestSchema } from "./validation";

describe("createCaseRequestSchema", () => {
  it("accepts expected output as free text without a separate input", () => {
    const parsed = createCaseRequestSchema.parse({
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Refund policy",
      userMessage: "Can this item be returned?",
      expectedOutput: "No, this item cannot be returned after 30 days.",
    });

    expect(parsed).not.toHaveProperty("input");
    expect(parsed.expectedOutput).toBe(
      "No, this item cannot be returned after 30 days.",
    );
  });

  it("rejects structured expected output", () => {
    expect(() => createCaseRequestSchema.parse({
      suiteId: "suite",
      name: "Case",
      userMessage: "Prompt",
      expectedOutput: { answer: "No" },
    })).toThrow();
  });
});
