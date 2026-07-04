import { describe, expect, it } from "vitest";
import { createCaseRequestSchema } from "./validation";

describe("createCaseRequestSchema", () => {
  it("accepts input and expected output JSON objects", () => {
    const parsed = createCaseRequestSchema.parse({
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Refund policy",
      userMessage: "Can this item be returned?",
      input: { daysSincePurchase: 45 },
      expectedOutput: { answer: "No" },
    });

    expect(parsed.input).toEqual({ daysSincePurchase: 45 });
    expect(parsed.expectedOutput).toEqual({ answer: "No" });
  });

  it("rejects arrays and scalar JSON values", () => {
    expect(() => createCaseRequestSchema.parse({
      suiteId: "suite",
      name: "Case",
      userMessage: "Prompt",
      input: ["not", "an", "object"],
    })).toThrow();
  });
});
