import { promises as fs } from "node:fs";
import path from "node:path";
import { WorkspaceRoot } from "../domain/value-objects/workspace-root.value-object";
import { EvalAnnotation } from "../domain/entities/eval-annotation.entity";
import type { EvalAnnotationRepository } from "../domain/repositories/eval-annotation.repository";

export class FilesystemEvalAnnotationRepository
  implements EvalAnnotationRepository
{
  constructor() {}

  async save(
    workspaceRoot: WorkspaceRoot | undefined,
    annotation: EvalAnnotation,
  ): Promise<EvalAnnotation> {
    const root = this.requiredRoot(workspaceRoot?.toPrimitives());
    const primitives = annotation.toPrimitives();
    const runId = primitives.runId;
    const caseId = primitives.caseId;
    const annotationDirectory = this.safeJoin(root, "annotations", runId);
    const file = this.safeJoin(
      annotationDirectory,
      `${this.fileSafe(caseId)}.annotation.json`,
    );
    await fs.mkdir(annotationDirectory, { recursive: true });
    await this.atomicWriteJson(file, primitives);
    return annotation;
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
