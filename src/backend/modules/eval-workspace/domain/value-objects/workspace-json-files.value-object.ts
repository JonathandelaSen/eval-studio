import { ValueObject } from "@/backend/modules/shared";

export class WorkspaceJsonFiles extends ValueObject<string[]> {
  private constructor(private readonly value: string[]) {
    super();
  }

  static fromPrimitives(value: string[]): WorkspaceJsonFiles {
    return new WorkspaceJsonFiles([...value]);
  }

  toPrimitives(): string[] {
    return [...this.value];
  }
}
