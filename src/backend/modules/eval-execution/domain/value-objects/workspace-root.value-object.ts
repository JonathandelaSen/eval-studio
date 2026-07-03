import { ValueObject } from "@/backend/modules/shared";

const EMPTY_WORKSPACE_ROOT_MESSAGE = "Workspace root cannot be empty.";

class WorkspaceRootError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceRootError";
  }
}

export class WorkspaceRoot extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) throw new WorkspaceRootError(EMPTY_WORKSPACE_ROOT_MESSAGE);
    this.value = trimmed;
  }

  static fromPrimitives(value: string): WorkspaceRoot {
    return new WorkspaceRoot(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
