import { ValueObject } from "@/backend/modules/shared";

const EMPTY_DIRECTORY_NAME_MESSAGE = "Directory name cannot be empty.";

class DirectoryNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DirectoryNameError";
  }
}

export class DirectoryName extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) throw new DirectoryNameError(EMPTY_DIRECTORY_NAME_MESSAGE);
    this.value = trimmed;
  }

  static fromPrimitives(value: string): DirectoryName {
    return new DirectoryName(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
