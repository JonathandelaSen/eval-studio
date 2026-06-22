import { ValueObject } from "@/backend/modules/shared";

class EvalTemperatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvalTemperatureError";
  }
}

const INVALID_TEMPERATURE_MESSAGE = "Temperature must be a finite number between 0 and 2.";
const MIN_TEMP = 0;
const MAX_TEMP = 2;

export class EvalTemperature extends ValueObject<number> {
  private readonly value: number;

  private constructor(value: number) {
    super();
    if (!Number.isFinite(value) || value < MIN_TEMP || value > MAX_TEMP) {
      throw new EvalTemperatureError(INVALID_TEMPERATURE_MESSAGE);
    }
    this.value = value;
  }

  static fromPrimitives(value: number): EvalTemperature {
    return new EvalTemperature(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
