import { StringId } from "@/backend/modules/shared";
import type { Timestamp } from "@/backend/modules/shared";
import type { EvalModel } from "./eval-model.value-object";
import type { EvalProvider } from "./eval-provider.value-object";
import type { Producer } from "./producer.value-object";

const REMOVE_SEPARATORS_REGEX = /[-:]/g;
const REMOVE_MILLISECONDS_REGEX = /\.\d{3}/;
const EMPTY_STRING = "";
const DOT_SEPARATOR = ".";
const HYPHEN_SEPARATOR = "-";

const SLUG_REGEX = /[^a-z0-9._-]+/g;
const SLUG_REPLACEMENT = "-";
const SLUG_START = 0;
const SLUG_MAX_LENGTH = 80;

export class EvalRunId extends StringId {
  private constructor(value: string) {
    super(value);
  }

  static create(input: {
    createdAt: Timestamp;
    producer: Producer;
    provider: EvalProvider;
    model: EvalModel;
  }): EvalRunId {
    const createdAt = input.createdAt.toPrimitives();
    const timestamp = createdAt
      .replace(REMOVE_SEPARATORS_REGEX, EMPTY_STRING)
      .replace(REMOVE_MILLISECONDS_REGEX, EMPTY_STRING);

    return new EvalRunId(
      timestamp +
        DOT_SEPARATOR +
        input.producer.toPrimitives() +
        HYPHEN_SEPARATOR +
        input.provider.toPrimitives() +
        HYPHEN_SEPARATOR +
        EvalRunId.slug(input.model.toPrimitives())
    );
  }

  static fromPrimitives(value: string): EvalRunId {
    return new EvalRunId(value);
  }

  private static slug(value: string): string {
    return value.toLowerCase().replace(SLUG_REGEX, SLUG_REPLACEMENT).slice(SLUG_START, SLUG_MAX_LENGTH);
  }
}
