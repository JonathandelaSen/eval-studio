import { ValueObject } from "@/backend/modules/shared";
import { EvalModel } from "./eval-model.value-object";
import { EvalProvider } from "./eval-provider.value-object";
import { EvalTemperatureNullable } from "./eval-temperature-nullable.value-object";

export interface EvalRuntimePrimitives extends Record<string, unknown> {
  provider: string;
  model: string;
  temperature: number | null;
}

export class EvalRuntime extends ValueObject<EvalRuntimePrimitives> {
  private constructor(
    private readonly provider: EvalProvider,
    private readonly model: EvalModel,
    private readonly temperature: EvalTemperatureNullable,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalRuntimePrimitives): EvalRuntime {
    return new EvalRuntime(
      EvalProvider.fromPrimitives(primitives.provider),
      EvalModel.fromPrimitives(primitives.model),
      EvalTemperatureNullable.fromPrimitives(primitives.temperature),
    );
  }

  static create(input: {
    provider: EvalProvider;
    model: EvalModel;
    temperature: EvalTemperatureNullable;
  }): EvalRuntime {
    return new EvalRuntime(input.provider, input.model, input.temperature);
  }

  toPrimitives(): EvalRuntimePrimitives {
    return {
      provider: this.provider.toPrimitives(),
      model: this.model.toPrimitives(),
      temperature: this.temperature.toPrimitives(),
    };
  }

  get providerValue(): EvalProvider {
    return this.provider;
  }

  get modelValue(): EvalModel {
    return this.model;
  }

  get temperatureValue(): EvalTemperatureNullable {
    return this.temperature;
  }
}
