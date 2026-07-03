import { describe, expect, it } from "vitest";
import { EVAL_PROVIDERS, EvalProvider } from "./eval-provider.value-object";

describe("EvalProvider", () => {
  it("creates and round-trips valid providers", () => {
    expect(EvalProvider.fromPrimitives("openai").toPrimitives()).toBe("openai");
    expect(EvalProvider.fromPrimitives("ollama").toPrimitives()).toBe("ollama");
    expect(EvalProvider.fromPrimitives("mock").toPrimitives()).toBe("mock");
    expect(EvalProvider.fromPrimitives("custom-provider").toPrimitives()).toBe("custom-provider");
  });

  it("throws on empty provider value", () => {
    expect(() => EvalProvider.fromPrimitives(" ")).toThrow("Provider cannot be empty.");
  });

  it("identifies providers correctly with checkers and semantic constructors", () => {
    const openai = EvalProvider.openai();
    expect(openai.toPrimitives()).toBe("openai");
    expect(openai.isOpenai()).toBe(true);
    expect(openai.isMock()).toBe(false);

    const mock = EvalProvider.mock();
    expect(mock.toPrimitives()).toBe("mock");
    expect(mock.isMock()).toBe(true);

    const ollama = EvalProvider.ollama();
    expect(ollama.toPrimitives()).toBe("ollama");
    expect(ollama.isOllama()).toBe(true);

    const apple = EvalProvider.apple();
    expect(EVAL_PROVIDERS).toContain("apple");
    expect(apple.toPrimitives()).toBe("apple");
    expect(apple.isApple()).toBe(true);
  });
});
