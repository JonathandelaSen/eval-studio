import { promises as fs } from "node:fs";
import path from "node:path";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

export class FilesystemEvalRunRepository implements EvalRunRepository {
  constructor(private readonly workspaceRoot: string | undefined) {}

  async save(run: EvalRun): Promise<EvalRun> {
    const root = this.requiredRoot();
    const primitives = run.toPrimitives();
    const directory = this.safeJoin(root, "runs", primitives.runId);
    await fs.mkdir(this.safeJoin(directory, "results"), { recursive: true });
    await this.atomicWriteJson(this.safeJoin(directory, "run.json"), primitives);
    return run;
  }

  private async atomicWriteJson(file: string, value: unknown) {
    const temp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await fs.rename(temp, file);
  }

  private requiredRoot() {
    if (!this.workspaceRoot) {
      throw new Error("EVAL_STUDIO_WORKSPACE is missing.");
    }
    return path.resolve(this.workspaceRoot);
  }

  private safeJoin(root: string, ...segments: string[]) {
    const target = path.resolve(root, ...segments);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      throw new Error("Path escapes EVAL_STUDIO_WORKSPACE.");
    }
    return target;
  }
}
