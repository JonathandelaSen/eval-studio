import { ValueObject } from "@/backend/modules/shared";

const EMPTY_DIRECTORY = null;
const EMPTY_PROJECT_DIRECTORY_MESSAGE = "Project directory cannot be empty.";

class ProjectDirectoryNullableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectDirectoryNullableError";
  }
}

export class ProjectDirectoryNullable extends ValueObject<string | null> {
  private readonly value: string | null;

  private constructor(value: string | null) {
    super();
    if (value === EMPTY_DIRECTORY) {
      this.value = EMPTY_DIRECTORY;
      return;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      throw new ProjectDirectoryNullableError(EMPTY_PROJECT_DIRECTORY_MESSAGE);
    }
    this.value = trimmed;
  }

  static fromPrimitives(value: string | null): ProjectDirectoryNullable {
    return new ProjectDirectoryNullable(value);
  }

  static empty(): ProjectDirectoryNullable {
    return new ProjectDirectoryNullable(EMPTY_DIRECTORY);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
