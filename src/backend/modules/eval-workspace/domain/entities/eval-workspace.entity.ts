import { AggregateRoot } from "@/backend/modules/shared";
import type {
  EvalResultPrimitives,
  EvalRunPrimitives,
} from "@/backend/modules/eval-execution";
import type { EvalAnnotationPrimitives } from "./eval-annotation.entity";
import { WorkspaceRootNullable } from "../value-objects/workspace-root-nullable.value-object";
import { EvalManifestNullable } from "../value-objects/eval-manifest-nullable.value-object";
import { EvalSuites } from "../value-objects/eval-suites.value-object";
import { EvalCases } from "../value-objects/eval-cases.value-object";
import { EvalRuns } from "../value-objects/eval-runs.value-object";
import { EvalResults } from "../value-objects/eval-results.value-object";
import { EvalAnnotations } from "../value-objects/eval-annotations.value-object";
import { WorkspaceDiagnostics } from "../value-objects/workspace-diagnostics.value-object";

export type JsonRecord = Record<string, unknown>;

export interface CapturedPromptPrimitives extends JsonRecord {
  format: string;
}

export interface RuntimePrimitives extends JsonRecord {
  provider: string;
  model: string;
  temperature?: number;
}

export interface EvalManifestPrimitives extends JsonRecord {
  workspaceName: string;
  createdAt: string;
}

export interface EvalSuitePrimitives extends JsonRecord {
  suiteId: string;
  actionId: string;
  name: string;
  description?: string;
  caseIds: string[];
}

export interface EvalCasePrimitives extends JsonRecord {
  caseId: string;
  actionId: string;
  name: string;
  note?: string;
  createdAt: string;
  createdBy?: JsonRecord;
  input?: JsonRecord;
  promptTemplate?: CapturedPromptPrimitives;
  promptVariables?: JsonRecord;
  renderedPrompt: CapturedPromptPrimitives;
  runtime?: RuntimePrimitives;
  expectedOutput?: JsonRecord;
  source?: JsonRecord;
}

export type WorkspaceDiagnostic = {
  path: string;
  message: string;
};

export interface EvalWorkspacePrimitives {
  workspaceRoot: string | null;
  manifest: EvalManifestPrimitives | null;
  suites: EvalSuitePrimitives[];
  cases: EvalCasePrimitives[];
  runs: EvalRunPrimitives[];
  results: EvalResultPrimitives[];
  annotations: EvalAnnotationPrimitives[];
  diagnostics: WorkspaceDiagnostic[];
}

export interface EvalWorkspaceCreateParams {
  id: WorkspaceRootNullable;
  manifest: EvalManifestNullable;
  suites: EvalSuites;
  cases: EvalCases;
  runs: EvalRuns;
  results: EvalResults;
  annotations: EvalAnnotations;
  diagnostics: WorkspaceDiagnostics;
}

export class EvalWorkspace extends AggregateRoot {
  private constructor(
    private readonly workspaceRootVal: WorkspaceRootNullable,
    private readonly manifestVal: EvalManifestNullable,
    private readonly suitesVal: EvalSuites,
    private readonly casesVal: EvalCases,
    private readonly runsVal: EvalRuns,
    private readonly resultsVal: EvalResults,
    private readonly annotationsVal: EvalAnnotations,
    private readonly diagnosticsVal: WorkspaceDiagnostics,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalWorkspacePrimitives): EvalWorkspace {
    return new EvalWorkspace(
      WorkspaceRootNullable.fromPrimitives(primitives.workspaceRoot),
      EvalManifestNullable.fromPrimitives(primitives.manifest),
      EvalSuites.fromPrimitives(primitives.suites),
      EvalCases.fromPrimitives(primitives.cases),
      EvalRuns.fromPrimitives(primitives.runs),
      EvalResults.fromPrimitives(primitives.results),
      EvalAnnotations.fromPrimitives(primitives.annotations),
      WorkspaceDiagnostics.fromPrimitives(primitives.diagnostics),
    );
  }

  static create(input: EvalWorkspaceCreateParams): EvalWorkspace {
    return new EvalWorkspace(
      input.id,
      input.manifest,
      input.suites,
      input.cases,
      input.runs,
      input.results,
      input.annotations,
      input.diagnostics,
    );
  }

  get id(): WorkspaceRootNullable {
    return this.workspaceRootVal;
  }

  toPrimitives(): EvalWorkspacePrimitives {
    return {
      workspaceRoot: this.workspaceRootVal.toPrimitives(),
      manifest: this.manifestVal.toPrimitives(),
      suites: this.suitesVal.toPrimitives(),
      cases: this.casesVal.toPrimitives(),
      runs: this.runsVal.toPrimitives(),
      results: this.resultsVal.toPrimitives(),
      annotations: this.annotationsVal.toPrimitives(),
      diagnostics: this.diagnosticsVal.toPrimitives(),
    };
  }
}
