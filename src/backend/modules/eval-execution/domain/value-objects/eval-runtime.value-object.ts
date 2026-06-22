import { ValueObject } from "@/backend/modules/shared";
import { EvalModel } from "./eval-model.value-object";
import { EvalProvider } from "./eval-provider.value-object";
import { EvalTemperature } from "./eval-temperature.value-object";

export interface EvalRuntimePrimitives extends Record<string, unknown> {
  provider: string;
  model: string;
  temperature?: number;
}

export class EvalRuntime extends ValueObject<EvalRuntimePrimitives> {
  private constructor(
    private readonly provider: EvalProvider,
    private readonly model: EvalModel,
    private readonly temperature?: EvalTemperature
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalRuntimePrimitives): EvalRuntime {
    return new EvalRuntime(
      EvalProvider.fromPrimitives(primitives.provider),
      EvalModel.fromPrimitives(primitives.model),
      primitives.temperature !== undefined && primitives.temperature !== null
        ? EvalTemperature.fromPrimitives(primitives.temperature)
        : undefined
    );
  }

  static create(input: {
    provider: EvalProvider;
    model: EvalModel;
    temperature?: EvalTemperature;
  }): EvalRuntime {
    return new EvalRuntime(input.provider, input.model, input.temperature);
  }

  toPrimitives(): EvalRuntimePrimitives {
    return {
      provider: this.provider.toPrimitives(),
      model: this.model.toPrimitives(),
      temperature: this.temperature ? this.temperature.toPrimitives() : undefined,
    };
  }

  get providerValue(): EvalProvider {
    return this.provider;
  }

  get modelValue(): EvalModel {
    return this.model;
  }

  get temperatureValue(): EvalTemperature | undefined {
    return this.temperature;
  }
}
