import { promises as fs } from "node:fs";
import path from "node:path";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { EvalRunId } from "../../domain/value-objects/eval-run-id.value-object";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import { RunNotFoundError } from "../../domain/errors/run-not-found.error";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

export class FilesystemEvalRunRepository implements EvalRunRepository {
  constructor() {}

  async save(
    workspaceRoot: WorkspaceRoot | undefined,
    run: EvalRun,
  ): Promise<EvalRun> {
    const root = this.requiredRoot(workspaceRoot?.toPrimitives());
    const primitives = run.toPrimitives();
    const directory = this.safeJoin(root, "runs", primitives.runId);
    await fs.mkdir(this.safeJoin(directory, "results"), { recursive: true });
    await this.atomicWriteJson(
      this.safeJoin(directory, "metadata.run.json"),
      primitives,
    );
    return run;
  }

  async find(
    workspaceRoot: WorkspaceRoot | undefined,
    runId: EvalRunId,
  ): Promise<EvalRun> {
    const root = this.requiredRoot(workspaceRoot?.toPrimitives());
    const directory = this.safeJoin(root, "runs", runId.toPrimitives());
    for (const fileName of ["metadata.run.json", "run.json"]) {
      try {
        const raw = await fs.readFile(this.safeJoin(directory, fileName), "utf8");
        return EvalRun.fromPrimitives(JSON.parse(raw));
      } catch {
        continue;
      }
    }
    throw new RunNotFoundError();
  }

  async delete(
    workspaceRoot: WorkspaceRoot | undefined,
    runId: EvalRunId,
  ): Promise<EvalRunId> {
    const root = this.requiredRoot(workspaceRoot?.toPrimitives());
    const directory = this.safeJoin(root, "runs", runId.toPrimitives());
    try {
      const stat = await fs.stat(directory);
      if (!stat.isDirectory()) throw new RunNotFoundError();
    } catch (error) {
      if (error instanceof RunNotFoundError) throw error;
      throw new RunNotFoundError();
    }
    await fs.rm(directory, { recursive: true, force: true });
    return runId;
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
}
