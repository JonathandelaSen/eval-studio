import { promises as fs } from "node:fs";
import path from "node:path";
import {
  annotationSchema,
  caseSchema,
  manifestSchema,
  resultSchema,
  runSchema,
  suiteSchema,
  type EvalAnnotation as EvalAnnotationPrimitives,
  type EvalCase,
  type EvalResult,
  type EvalRun,
  type EvalSuite,
  type WorkspaceDiagnostic,
  type EvalWorkspaceSnapshot as EvalWorkspaceSnapshotPrimitives,
} from "../domain/artifacts";
import { EvalAnnotation } from "../domain/entities/eval-annotation.entity";
import { EvalWorkspaceSnapshot } from "../domain/entities/eval-workspace-snapshot.entity";
import type { EvalWorkspaceRepository } from "../domain/repositories/eval-workspace.repository";

type ArtifactKind = "suite" | "case" | "run" | "result" | "annotation";

const schemaByKind = {
  suite: suiteSchema,
  case: caseSchema,
  run: runSchema,
  result: resultSchema,
  annotation: annotationSchema,
};

export class FilesystemEvalWorkspaceRepository
  implements EvalWorkspaceRepository
{
  constructor(private readonly workspaceRoot: string | undefined) {}

  async scan(): Promise<EvalWorkspaceSnapshot> {
    const snapshot: EvalWorkspaceSnapshotPrimitives = {
      workspaceRoot: this.workspaceRoot ?? null,
      manifest: null,
      suites: [],
      cases: [],
      runs: [],
      results: [],
      annotations: [],
      diagnostics: [],
    };

    if (!this.workspaceRoot) {
      snapshot.diagnostics.push({
        path: ".env.local",
        message: "EVAL_STUDIO_WORKSPACE is missing.",
      });
      return EvalWorkspaceSnapshot.fromPrimitives(snapshot);
    }

    try {
      const stat = await fs.stat(this.workspaceRoot);
      if (!stat.isDirectory()) {
        snapshot.diagnostics.push({
          path: this.workspaceRoot,
          message: "EVAL_STUDIO_WORKSPACE is not a directory.",
        });
        return EvalWorkspaceSnapshot.fromPrimitives(snapshot);
      }
    } catch {
      snapshot.diagnostics.push({
        path: this.workspaceRoot,
        message: "EVAL_STUDIO_WORKSPACE is unreadable.",
      });
      return EvalWorkspaceSnapshot.fromPrimitives(snapshot);
    }

    snapshot.manifest = await this.readManifest(snapshot.diagnostics);
    await Promise.all([
      this.collect("suite", "suites", snapshot),
      this.collect("case", "suites", snapshot),
      this.collect("run", "runs", snapshot),
      this.collect("result", "runs", snapshot),
      this.collect("annotation", "annotations", snapshot),
    ]);

    return EvalWorkspaceSnapshot.fromPrimitives(snapshot);
  }

  async saveAnnotation(annotation: EvalAnnotation): Promise<EvalAnnotation> {
    const root = this.requiredRoot();
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

  private async readManifest(diagnostics: WorkspaceDiagnostic[]) {
    const root = this.requiredRoot();
    const file = this.safeJoin(root, "manifest.json");
    try {
      const raw = await fs.readFile(file, "utf8");
      return manifestSchema.parse(JSON.parse(raw));
    } catch (error) {
      diagnostics.push({
        path: this.relative(file),
        message:
          error instanceof Error
            ? `Invalid or missing manifest: ${error.message}`
            : "Invalid or missing manifest.",
      });
      return null;
    }
  }

  private async collect(
    kind: ArtifactKind,
    directoryName: "suites" | "runs" | "annotations",
    snapshot: EvalWorkspaceSnapshotPrimitives,
  ) {
    const root = this.requiredRoot();
    const directory = this.safeJoin(root, directoryName);
    const files = await this.findJsonFiles(directory).catch(() => []);

    for (const file of files) {
      if (!this.matchesKind(kind, file)) continue;
      try {
        const raw = await fs.readFile(file, "utf8");
        const parsed = this.parseKind(kind, JSON.parse(raw));
        if (kind === "suite") snapshot.suites.push(parsed as EvalSuite);
        if (kind === "case") snapshot.cases.push(parsed as EvalCase);
        if (kind === "run") snapshot.runs.push(parsed as EvalRun);
        if (kind === "result") snapshot.results.push(parsed as EvalResult);
        if (kind === "annotation") {
          snapshot.annotations.push(parsed as EvalAnnotationPrimitives);
        }
      } catch (error) {
        snapshot.diagnostics.push({
          path: this.relative(file),
          message:
            error instanceof Error
              ? `Invalid ${kind}: ${error.message}`
              : `Invalid ${kind}.`,
        });
      }
    }
  }

  private matchesKind(kind: ArtifactKind, file: string) {
    const name = path.basename(file);
    if (kind === "suite") return name === "suite.json";
    return name.endsWith(`.${kind}.json`);
  }

  private parseKind(kind: ArtifactKind, value: unknown) {
    return schemaByKind[kind].parse(value);
  }

  private async findJsonFiles(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const child = path.join(directory, entry.name);
        if (entry.isDirectory()) return this.findJsonFiles(child);
        if (entry.isFile() && entry.name.endsWith(".json")) return [child];
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

  private relative(file: string) {
    return this.workspaceRoot ? path.relative(this.workspaceRoot, file) : file;
  }

  private fileSafe(value: string) {
    return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
  }
}
