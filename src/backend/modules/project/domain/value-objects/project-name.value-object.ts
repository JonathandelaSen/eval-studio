import { ValueObject } from "@/backend/modules/shared";

const EMPTY_PROJECT_NAME_MESSAGE = "Project name cannot be empty.";

class ProjectNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectNameError";
  }
}

export class ProjectName extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) throw new ProjectNameError(EMPTY_PROJECT_NAME_MESSAGE);
    this.value = trimmed;
  }

  static fromPrimitives(value: string): ProjectName {
    return new ProjectName(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
