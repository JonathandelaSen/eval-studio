import { describe, expect, it } from "vitest";
import { AvailableProviders } from "./available-providers.value-object";

describe("AvailableProviders", () => {
  it("round-trips provider capabilities", () => {
    const value = [{ id: "ollama" as const, label: "Ollama", available: true, models: [{ id: "llama", label: "llama" }] }];
    expect(AvailableProviders.fromPrimitives(value).toPrimitives()).toEqual(value);
  });
});
