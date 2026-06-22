import { ValueObject } from "@/backend/modules/shared";

export const EVAL_PROVIDERS = ["mock", "openai", "ollama"] as const;
export type EvalProviderPrimitives = (typeof EVAL_PROVIDERS)[number];

const MOCK_PROVIDER = EVAL_PROVIDERS[0];
const OPENAI_PROVIDER = EVAL_PROVIDERS[1];
const OLLAMA_PROVIDER = EVAL_PROVIDERS[2];

class EvalProviderError extends Error {
  constructor(value: string) {
    super(`Invalid provider: ${value}`);
    this.name = "EvalProviderError";
  }
}

export class EvalProvider extends ValueObject<EvalProviderPrimitives> {
  private readonly value: EvalProviderPrimitives;

  private constructor(value: string) {
    super();
    const matched = EVAL_PROVIDERS.find((p) => p === value);
    if (!matched) {
      throw new EvalProviderError(value);
    }
    this.value = matched;
  }

  static fromPrimitives(value: string): EvalProvider {
    return new EvalProvider(value);
  }

  static mock(): EvalProvider {
    return new EvalProvider(MOCK_PROVIDER);
  }

  static openai(): EvalProvider {
    return new EvalProvider(OPENAI_PROVIDER);
  }

  static ollama(): EvalProvider {
    return new EvalProvider(OLLAMA_PROVIDER);
  }

  isMock(): boolean {
    return this.value === MOCK_PROVIDER;
  }

  isOpenai(): boolean {
    return this.value === OPENAI_PROVIDER;
  }

  isOllama(): boolean {
    return this.value === OLLAMA_PROVIDER;
  }

  toPrimitives(): EvalProviderPrimitives {
    return this.value;
  }
}
