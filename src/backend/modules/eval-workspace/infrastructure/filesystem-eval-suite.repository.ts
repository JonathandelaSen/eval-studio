import { promises as fs } from "node:fs";
import path from "node:path";
import { EvalSuite } from "../domain/entities/eval-suite.entity";
import type { EvalSuiteRepository } from "../domain/repositories/eval-suite.repository";
import type { SuiteId } from "../domain/value-objects/suite-id.value-object";
import type { WorkspaceRoot } from "../domain/value-objects/workspace-root.value-object";

export class FilesystemEvalSuiteRepository implements EvalSuiteRepository {
  async find(root: WorkspaceRoot | undefined, suiteId: SuiteId): Promise<EvalSuite> {
    const raw = await fs.readFile(
      path.join(this.root(root), "suites", suiteId.toPrimitives(), "suite.json"),
      "utf8",
    );
    return EvalSuite.fromPrimitives(JSON.parse(raw));
  }

  async save(root: WorkspaceRoot | undefined, suite: EvalSuite): Promise<EvalSuite> {
    const directory = path.join(this.root(root), "suites", suite.id.toPrimitives());
    await fs.mkdir(path.join(directory, "cases"), { recursive: true });
    await this.write(path.join(directory, "suite.json"), suite.toPrimitives());
    return suite;
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
