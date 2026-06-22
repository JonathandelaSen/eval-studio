import { ValueObject } from "@/backend/modules/shared";

export class HumanScore extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
  }

  static fromPrimitives(value: number): HumanScore {
    if (!Number.isInteger(value) || value < 0 || value > 5) {
      throw new Error("Human score must be an integer from 0 to 5.");
    }
    return new HumanScore(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
