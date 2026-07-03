import { ValueObject } from "@/backend/modules/shared";

const EMPTY_PROJECT_DIRECTORY_MESSAGE = "Project directory cannot be empty.";

class ProjectDirectoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectDirectoryError";
  }
}

export class ProjectDirectory extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) throw new ProjectDirectoryError(EMPTY_PROJECT_DIRECTORY_MESSAGE);
    this.value = trimmed;
  }

  static fromPrimitives(value: string): ProjectDirectory {
    return new ProjectDirectory(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
