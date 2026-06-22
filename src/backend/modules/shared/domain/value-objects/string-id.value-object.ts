import { ValueObject } from "./value-object";

const WORD_BOUNDARIES_REGEX = /([a-z])([A-Z])/g;
const WORD_BOUNDARIES_REPLACEMENT = "$1 $2";
const ID_SUFFIX_REGEX = /Id$/;
const ID_SUFFIX_REPLACEMENT = " id";
const EMPTY_ERROR_SUFFIX = " cannot be empty.";

class StringIdError extends Error {
  constructor(label: string) {
    super(label + EMPTY_ERROR_SUFFIX);
    this.name = "StringIdError";
  }
}

export class StringId extends ValueObject<string> {
  protected constructor(private readonly value: string) {
    super();
    if (!value.trim()) {
      const label = this.constructor.name
        .replace(WORD_BOUNDARIES_REGEX, WORD_BOUNDARIES_REPLACEMENT)
        .replace(ID_SUFFIX_REGEX, ID_SUFFIX_REPLACEMENT);
      throw new StringIdError(label);
    }
  }

  static fromPrimitives(value: string): StringId {
    return new StringId(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
