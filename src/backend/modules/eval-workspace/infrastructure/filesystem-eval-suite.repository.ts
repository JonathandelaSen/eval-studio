import { promises as fs } from "node:fs";
import path from "node:path";
import { EvalSuite } from "../domain/entities/eval-suite.entity";
import type { EvalSuiteRepository } from "../domain/repositories/eval-suite.repository";
import type { SuiteId } from "../domain/value-objects/suite-id.value-object";
import type { WorkspaceRoot } from "../domain/value-objects/workspace-root.value-object";
import { locateSuiteFile } from "./filesystem-eval-suite-locator";

export class FilesystemEvalSuiteRepository implements EvalSuiteRepository {
  async find(root: WorkspaceRoot | undefined, suiteId: SuiteId): Promise<EvalSuite> {
    const workspaceRoot = this.root(root);
    const file =
      (await locateSuiteFile(workspaceRoot, suiteId.toPrimitives())) ??
      path.join(workspaceRoot, "suites", suiteId.toPrimitives(), "suite.json");
    const raw = await fs.readFile(file, "utf8");
    return EvalSuite.fromPrimitives(JSON.parse(raw));
  }

  async save(root: WorkspaceRoot | undefined, suite: EvalSuite): Promise<EvalSuite> {
    const workspaceRoot = this.root(root);
    const existingFile = await locateSuiteFile(
      workspaceRoot,
      suite.id.toPrimitives(),
    );
    const directory = existingFile
      ? path.dirname(existingFile)
      : path.join(workspaceRoot, "suites", suite.id.toPrimitives());
    await fs.mkdir(path.join(directory, "cases"), { recursive: true });
    await this.write(path.join(directory, "suite.json"), suite.toPrimitives());
    return suite;
  }

  async delete(
    root: WorkspaceRoot | undefined,
    suiteId: SuiteId,
  ): Promise<SuiteId> {
    const workspaceRoot = this.root(root);
    const suitesDirectory = path.join(workspaceRoot, "suites");
    const conventionalDirectory = path.resolve(
      suitesDirectory,
      suiteId.toPrimitives(),
    );
    if (!conventionalDirectory.startsWith(`${suitesDirectory}${path.sep}`)) {
      throw new Error("Path escapes the suites directory.");
    }
    const file =
      (await locateSuiteFile(workspaceRoot, suiteId.toPrimitives())) ??
      path.join(conventionalDirectory, "suite.json");
    await fs.rm(path.dirname(file), { recursive: true });
    return suiteId;
  }

  private root(value: WorkspaceRoot | undefined): string {
    if (!value) throw new Error("No project is selected.");
    return path.resolve(value.toPrimitives());
  }

  private async write(file: string, value: unknown): Promise<void> {
    const temp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await fs.rename(temp, file);
  }
}
