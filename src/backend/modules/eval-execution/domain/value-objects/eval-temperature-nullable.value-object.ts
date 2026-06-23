import { ValueObject } from "@/backend/modules/shared";
import { EvalTemperature } from "./eval-temperature.value-object";

export class EvalTemperatureNullable extends ValueObject<number | null> {
  private constructor(private readonly value: EvalTemperature | null) {
    super();
  }

  static fromPrimitives(value: number | null | undefined): EvalTemperatureNullable {
    if (value === undefined || value === null) {
      return new EvalTemperatureNullable(null);
    }
    return new EvalTemperatureNullable(EvalTemperature.fromPrimitives(value));
  }

  static fromValue(value: EvalTemperature | null): EvalTemperatureNullable {
    return new EvalTemperatureNullable(value);
  }

  static empty(): EvalTemperatureNullable {
    return new EvalTemperatureNullable(null);
  }

  toPrimitives(): number | null {
    return this.value ? this.value.toPrimitives() : null;
  }

  get valueValue(): EvalTemperature | null {
    return this.value;
  }

  get isNull(): boolean {
    return this.value === null;
  }
}
