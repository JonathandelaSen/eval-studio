import { ValueObject } from "@/backend/modules/shared";

class HumanScoreError extends Error {
  constructor() {
    super("Human score must be an integer from 0 to 5.");
    this.name = "HumanScoreError";
  }
}

const MIN_SCORE = 0;
const MAX_SCORE = 5;

export class HumanScore extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
    if (!Number.isInteger(value) || value < MIN_SCORE || value > MAX_SCORE) {
      throw new HumanScoreError();
    }
  }

  static fromPrimitives(value: number): HumanScore {
    return new HumanScore(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
