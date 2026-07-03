import { ValueObject } from "@/backend/modules/shared";
import { WorkspaceRoot } from "./workspace-root.value-object";

export class WorkspaceRootNullable extends ValueObject<string | null> {
  private readonly value: WorkspaceRoot | null;

  private constructor(value: WorkspaceRoot | null) {
    super();
    this.value = value;
  }

  static fromPrimitives(value: string | null): WorkspaceRootNullable {
    if (value === null) {
      return new WorkspaceRootNullable(null);
    }
    return new WorkspaceRootNullable(WorkspaceRoot.fromPrimitives(value));
  }

  toPrimitives(): string | null {
    return this.value ? this.value.toPrimitives() : null;
  }
}
