import { promises as fs } from "node:fs";
import path from "node:path";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalResult } from "../../domain/entities/eval-result.entity";
import type { EvalResultRepository } from "../../domain/repositories/eval-result.repository";

export class FilesystemEvalResultRepository implements EvalResultRepository {
  constructor() {}

  async save(
    workspaceRoot: WorkspaceRoot | undefined,
    result: EvalResult,
  ): Promise<EvalResult> {
    const root = this.requiredRoot(workspaceRoot?.toPrimitives());
    const primitives = result.toPrimitives();
    const directory = this.safeJoin(root, "runs", primitives.runId, "results");
    await fs.mkdir(directory, { recursive: true });
    await this.atomicWriteJson(
      this.safeJoin(directory, `${this.fileSafe(primitives.caseId)}.result.json`),
      primitives,
    );
    return result;
  }

  private async atomicWriteJson(file: string, value: unknown) {
    const temp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await fs.rename(temp, file);
  }

  private requiredRoot(workspaceRoot: string | undefined) {
    if (!workspaceRoot) {
      throw new Error("No project is selected.");
    }
    return path.resolve(workspaceRoot);
  }

  private safeJoin(root: string, ...segments: string[]) {
    const target = path.resolve(root, ...segments);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      throw new Error("Path escapes the selected project.");
    }
    return target;
  }

  private fileSafe(value: string) {
    return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
  }
}
