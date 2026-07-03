import { ValueObject } from "@/backend/modules/shared";
import type { WorkspaceDiagnostic } from "../entities/eval-workspace.entity";

export class WorkspaceDiagnostics extends ValueObject<unknown> {
  private constructor(private readonly value: WorkspaceDiagnostic[]) {
    super();
  }

  static fromPrimitives(value: WorkspaceDiagnostic[]): WorkspaceDiagnostics {
    return new WorkspaceDiagnostics(value);
  }

  toPrimitives(): WorkspaceDiagnostic[] {
    return this.value;
  }
}
