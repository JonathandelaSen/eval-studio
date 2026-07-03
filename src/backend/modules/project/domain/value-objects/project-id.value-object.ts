import { ValueObject } from "@/backend/modules/shared";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEGACY_ID_PATTERN = /^[0-9a-f]{16}$/i;
const INVALID_PROJECT_ID_MESSAGE = "Project id must be a UUID.";

class ProjectIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectIdError";
  }
}

export class ProjectId extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!UUID_PATTERN.test(value) && !LEGACY_ID_PATTERN.test(value)) {
      throw new ProjectIdError(INVALID_PROJECT_ID_MESSAGE);
    }
  }

  static create(): ProjectId {
    return new ProjectId(crypto.randomUUID());
  }

  static fromPrimitives(value: string): ProjectId {
    return new ProjectId(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
