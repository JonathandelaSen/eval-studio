import { promises as fs } from "node:fs";
import path from "node:path";
import {
  EvalResult,
  EvalRun,
  type EvalResultPrimitives,
  type EvalRunPrimitives,
} from "@/backend/modules/eval-execution";
import { WorkspaceRoot } from "../domain/value-objects/workspace-root.value-object";
import {
  EvalAnnotation,
  type EvalAnnotationPrimitives,
} from "../domain/entities/eval-annotation.entity";
import {
  EvalWorkspace,
  type EvalCasePrimitives,
  type EvalManifestPrimitives,
  type EvalSuitePrimitives,
  type EvalWorkspacePrimitives,
  type WorkspaceDiagnostic,
} from "../domain/entities/eval-workspace.entity";
import type { EvalWorkspaceRepository } from "../domain/repositories/eval-workspace.repository";

type ArtifactKind = "suite" | "case" | "run" | "result" | "annotation";

export class FilesystemEvalWorkspaceRepository
  implements EvalWorkspaceRepository
{
  constructor() {}

  async get(workspaceRoot?: WorkspaceRoot): Promise<EvalWorkspace> {
    const rootPath = workspaceRoot?.toPrimitives();
    const snapshot: EvalWorkspacePrimitives = {
      workspaceRoot: rootPath ?? null,
      manifest: null,
      suites: [],
      cases: [],
      runs: [],
      results: [],
      annotations: [],
      diagnostics: [],
    };

    if (!rootPath) {
      snapshot.diagnostics.push({
        path: "Settings",
        message: "No project is selected.",
      });
      return EvalWorkspace.fromPrimitives(snapshot);
    }

    try {
      const stat = await fs.stat(rootPath);
      if (!stat.isDirectory()) {
        snapshot.diagnostics.push({
          path: rootPath,
          message: "The selected project is not a directory.",
        });
        return EvalWorkspace.fromPrimitives(snapshot);
      }
    } catch {
      snapshot.diagnostics.push({
        path: rootPath,
        message: "The selected project is unreadable.",
      });
      return EvalWorkspace.fromPrimitives(snapshot);
    }

    snapshot.manifest = await this.readManifest(rootPath, snapshot.diagnostics);
    await Promise.all([
      this.collect(rootPath, "suite", "suites", snapshot),
      this.collect(rootPath, "case", "suites", snapshot),
      this.collect(rootPath, "run", "runs", snapshot),
      this.collect(rootPath, "result", "runs", snapshot),
      this.collect(rootPath, "annotation", "annotations", snapshot),
    ]);

    return EvalWorkspace.fromPrimitives(snapshot);
  }

  private async readManifest(
    workspaceRoot: string,
    diagnostics: WorkspaceDiagnostic[],
  ) {
    const root = this.requiredRoot(workspaceRoot);
    const file = this.safeJoin(root, "manifest.json");
    try {
      const raw = await fs.readFile(file, "utf8");
      return this.parseManifest(JSON.parse(raw));
    } catch (error) {
      diagnostics.push({
        path: this.relative(workspaceRoot, file),
        message:
          error instanceof Error
            ? `Invalid or missing manifest: ${error.message}`
            : "Invalid or missing manifest.",
      });
      return null;
    }
  }

  private async collect(
    workspaceRoot: string,
    kind: ArtifactKind,
    directoryName: "suites" | "runs" | "annotations",
    snapshot: EvalWorkspacePrimitives,
  ) {
    const root = this.requiredRoot(workspaceRoot);
    const directory = this.safeJoin(root, directoryName);
    const files = await this.findJsonFiles(directory).catch(() => []);

    for (const file of files) {
      if (!this.matchesKind(kind, file)) continue;
      try {
        const raw = await fs.readFile(file, "utf8");
        const parsed = this.parseKind(kind, JSON.parse(raw));
        if (kind === "suite") snapshot.suites.push(parsed as EvalSuitePrimitives);
        if (kind === "case") snapshot.cases.push(parsed as EvalCasePrimitives);
        if (kind === "run") snapshot.runs.push(parsed as EvalRunPrimitives);
        if (kind === "result") snapshot.results.push(parsed as EvalResultPrimitives);
        if (kind === "annotation") {
          snapshot.annotations.push(parsed as EvalAnnotationPrimitives);
        }
      } catch (error) {
        snapshot.diagnostics.push({
          path: this.relative(workspaceRoot, file),
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
    if (kind === "suite") return this.parseSuite(value);
    if (kind === "case") return this.parseCase(value);
    if (kind === "run") return EvalRun.fromPrimitives(value as Parameters<typeof EvalRun.fromPrimitives>[0]).toPrimitives();
    if (kind === "result") return EvalResult.fromPrimitives(value as Parameters<typeof EvalResult.fromPrimitives>[0]).toPrimitives();
    return EvalAnnotation.fromPrimitives(value as EvalAnnotationPrimitives).toPrimitives();
  }

  private parseManifest(value: unknown): EvalManifestPrimitives {
    this.assertRecord(value, "manifest");
    this.assertString(value.workspaceName, "manifest.workspaceName");
    this.assertString(value.createdAt, "manifest.createdAt");
    return value as EvalManifestPrimitives;
  }

  private parseSuite(value: unknown): EvalSuitePrimitives {
    this.assertRecord(value, "suite");
    this.assertString(value.suiteId, "suite.suiteId");
    this.assertString(value.actionId, "suite.actionId");
    this.assertString(value.name, "suite.name");
    this.assertStringArray(value.caseIds, "suite.caseIds");
    return value as EvalSuitePrimitives;
  }

  private parseCase(value: unknown): EvalCasePrimitives {
    this.assertRecord(value, "case");
    this.assertString(value.caseId, "case.caseId");
    this.assertString(value.actionId, "case.actionId");
    this.assertString(value.name, "case.name");
    this.assertString(value.createdAt, "case.createdAt");
    this.assertRecord(value.renderedPrompt, "case.renderedPrompt");
    this.assertString(value.renderedPrompt.format, "case.renderedPrompt.format");
    return value as EvalCasePrimitives;
  }

  private assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`${label} must be an object.`);
    }
  }



  private assertString(value: unknown, label: string) {
    if (typeof value !== "string") {
      throw new Error(`${label} must be a string.`);
    }
  }

  private assertStringArray(value: unknown, label: string) {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
      throw new Error(`${label} must be a string array.`);
    }
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

  private relative(workspaceRoot: string | undefined, file: string) {
    return workspaceRoot ? path.relative(workspaceRoot, file) : file;
  }

  private fileSafe(value: string) {
    return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
  }
}
