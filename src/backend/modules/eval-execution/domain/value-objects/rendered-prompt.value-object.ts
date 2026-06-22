import { ValueObject } from "@/backend/modules/shared";

export interface RenderedPromptPrimitives extends Record<string, unknown> {
  format: string;
}

class RenderedPromptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RenderedPromptError";
  }
}

const MISSING_VALUE_MESSAGE = "RenderedPrompt cannot be empty.";
const EMPTY_FORMAT_MESSAGE = "RenderedPrompt format cannot be empty.";

export class RenderedPrompt extends ValueObject<unknown> {
  private constructor(private readonly value: RenderedPromptPrimitives) {
    super();
    if (!value) {
      throw new RenderedPromptError(MISSING_VALUE_MESSAGE);
    }
    if (!value.format.trim()) {
      throw new RenderedPromptError(EMPTY_FORMAT_MESSAGE);
    }
  }

  static fromPrimitives(value: RenderedPromptPrimitives): RenderedPrompt {
    return new RenderedPrompt(value);
  }

  toPrimitives(): RenderedPromptPrimitives {
    return this.value;
  }
}
