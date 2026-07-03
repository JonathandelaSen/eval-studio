import { ValueObject } from "@/backend/modules/shared";

export const EVAL_PROVIDERS = ["mock", "openai", "ollama"] as const;
export type EvalProviderPrimitives = string;

const MOCK_PROVIDER = EVAL_PROVIDERS[0];
const OPENAI_PROVIDER = EVAL_PROVIDERS[1];
const OLLAMA_PROVIDER = EVAL_PROVIDERS[2];

class EvalProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvalProviderError";
  }
}

const EMPTY_PROVIDER_MESSAGE = "Provider cannot be empty.";

export class EvalProvider extends ValueObject<EvalProviderPrimitives> {
  private readonly value: EvalProviderPrimitives;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new EvalProviderError(EMPTY_PROVIDER_MESSAGE);
    }
    const matched = EVAL_PROVIDERS.find((p) => p === trimmed);
    this.value = matched ?? trimmed;
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
