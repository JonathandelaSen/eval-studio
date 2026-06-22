import { ValueObject } from "./value-object";

const WORD_BOUNDARIES_REGEX = /([a-z])([A-Z])/g;
const WORD_BOUNDARIES_REPLACEMENT = "$1 $2";
const ID_SUFFIX_REGEX = /Id$/;
const ID_SUFFIX_REPLACEMENT = " id";
const EMPTY_ERROR_SUFFIX = " cannot be empty.";
const INVALID_UUID_ERROR_SUFFIX = " must be a valid UUID.";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class EntityIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntityIdError";
  }
}

export class EntityId extends ValueObject<string> {
  protected constructor(private readonly value: string) {
    super();
    const label = this.constructor.name
      .replace(WORD_BOUNDARIES_REGEX, WORD_BOUNDARIES_REPLACEMENT)
      .replace(ID_SUFFIX_REGEX, ID_SUFFIX_REPLACEMENT);

    if (!value.trim()) {
      throw new EntityIdError(label + EMPTY_ERROR_SUFFIX);
    }

    if (!UUID_REGEX.test(value)) {
      throw new EntityIdError(label + INVALID_UUID_ERROR_SUFFIX);
    }
  }

  static fromPrimitives(value: string): EntityId {
    return new EntityId(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}

