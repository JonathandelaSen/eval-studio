import { describe, expect, it } from "vitest";
import { EvalModel } from "./eval-model.value-object";
import { EvalProvider } from "./eval-provider.value-object";
import { EvalRuntime } from "./eval-runtime.value-object";
import { EvalTemperature } from "./eval-temperature.value-object";

describe("EvalRuntime", () => {
  it("can be created from components and serialized", () => {
    const provider = EvalProvider.openai();
    const model = EvalModel.fromPrimitives("gpt-5 mini");
    const temperature = EvalTemperature.fromPrimitives(1.5);
    const runtime = EvalRuntime.create({ provider, model, temperature });

    expect(runtime.providerValue.toPrimitives()).toBe("openai");
    expect(runtime.modelValue.toPrimitives()).toBe("gpt-5 mini");
    expect(runtime.temperatureValue?.toPrimitives()).toBe(1.5);

    expect(runtime.toPrimitives()).toEqual({
      provider: "openai",
      model: "gpt-5 mini",
      temperature: 1.5,
    });
  });

  it("can be created from primitives and round-tripped", () => {
    const runtime = EvalRuntime.fromPrimitives({
      provider: "ollama",
      model: "llama3",
    });

    expect(runtime.providerValue.toPrimitives()).toBe("ollama");
    expect(runtime.modelValue.toPrimitives()).toBe("llama3");
    expect(runtime.temperatureValue).toBeUndefined();

    expect(runtime.toPrimitives()).toEqual({
      provider: "ollama",
      model: "llama3",
      temperature: undefined,
    });
  });
});
