import { promises as fs } from "node:fs";
import path from "node:path";
import { WorkspaceRoot } from "../domain/value-objects/workspace-root.value-object";
import { CaseId } from "../domain/value-objects/case-id.value-object";
import { EvalCase } from "../domain/entities/eval-case.entity";
import { CaseNotFoundError } from "../domain/errors/case-not-found.error";
import type { EvalCaseRepository } from "../domain/repositories/eval-case.repository";
import { locateSuiteFile } from "./filesystem-eval-suite-locator";

export class FilesystemEvalCaseRepository implements EvalCaseRepository {
  constructor() {}

  async find(
    workspaceRoot: WorkspaceRoot | undefined,
    caseId: CaseId,
  ): Promise<EvalCase> {
    const located = await this.locate(workspaceRoot, caseId);
    return EvalCase.fromPrimitives(located.primitives);
  }

  async save(
    workspaceRoot: WorkspaceRoot | undefined,
    evalCase: EvalCase,
  ): Promise<EvalCase> {
    const primitives = evalCase.toPrimitives();
    let file: string;
    try {
      file = (await this.locate(workspaceRoot, evalCase.id)).file;
    } catch (error) {
      if (!(error instanceof CaseNotFoundError)) throw error;
      const root = this.requiredRoot(workspaceRoot?.toPrimitives());
      const suiteFile = await locateSuiteFile(root, primitives.suiteId);
      const directory = suiteFile
        ? path.join(path.dirname(suiteFile), "cases")
        : this.safeJoin(root, "suites", primitives.suiteId, "cases");
      await fs.mkdir(directory, { recursive: true });
      file = this.safeJoin(directory, `${primitives.caseId}.case.json`);
    }
    await this.atomicWriteJson(file, primitives);
    return evalCase;
  }

  async delete(
    workspaceRoot: WorkspaceRoot | undefined,
    caseId: CaseId,
  ): Promise<CaseId> {
    const located = await this.locate(workspaceRoot, caseId);
    await fs.rm(located.file);
    return caseId;
  }

  private async locate(workspaceRoot: WorkspaceRoot | undefined, caseId: CaseId) {
    const root = this.requiredRoot(workspaceRoot?.toPrimitives());
    const directory = this.safeJoin(root, "suites");
    const files = await this.findCaseFiles(directory).catch(() => []);
    const target = caseId.toPrimitives();

    for (const file of files) {
      try {
        const raw = await fs.readFile(file, "utf8");
        const rawValue = JSON.parse(raw) as Record<string, unknown>;
        const parsed = {
          ...rawValue,
          suiteId: rawValue.suiteId ?? rawValue.actionId,
        } as Parameters<typeof EvalCase.fromPrimitives>[0];
        if (parsed.caseId === target) return { file, primitives: parsed };
      } catch {
        continue;
      }
    }
    throw new CaseNotFoundError();
  }

  private async findCaseFiles(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const child = path.join(directory, entry.name);
        if (entry.isDirectory()) return this.findCaseFiles(child);
        if (entry.isFile() && entry.name.endsWith(".case.json")) return [child];
        return [];
      }),
    );
    return nested.flat();
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
