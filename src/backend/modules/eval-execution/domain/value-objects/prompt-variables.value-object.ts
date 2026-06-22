import { ValueObject } from "@/backend/modules/shared";

export type PromptVariablesValue = Record<string, unknown> | undefined;

export class PromptVariables extends ValueObject<PromptVariablesValue> {
  private constructor(private readonly value: PromptVariablesValue) {
    super();
  }

  static fromPrimitives(value: PromptVariablesValue): PromptVariables {
    return new PromptVariables(value);
  }

  static empty(): PromptVariables {
    return new PromptVariables(undefined);
  }

  toPrimitives(): PromptVariablesValue {
    return this.value;
  }
}
