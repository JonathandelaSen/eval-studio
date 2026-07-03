import { describe, expect, it } from "vitest";
import { CaseName } from "./case-name.value-object";

describe("CaseName", () => {
  it("keeps a valid name and trims whitespace", () => {
    expect(CaseName.fromPrimitives("  Summarize invoice  ").toPrimitives()).toBe(
      "Summarize invoice",
    );
  });

  it("rejects an empty name", () => {
    expect(() => CaseName.fromPrimitives("")).toThrow("Case name cannot be empty.");
    expect(() => CaseName.fromPrimitives("   ")).toThrow(
      "Case name cannot be empty.",
    );
  });
});
