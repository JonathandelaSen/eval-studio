import { AggregateRoot } from "@/backend/modules/shared";
import type {
  EvalResultPrimitives,
  EvalRunPrimitives,
} from "@/backend/modules/eval-execution";
import type { EvalAnnotationPrimitives } from "./eval-annotation.entity";

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

export class EvalWorkspace extends AggregateRoot {
  private constructor(private readonly primitives: EvalWorkspacePrimitives) {
    super();
  }

  static fromPrimitives(primitives: EvalWorkspacePrimitives): EvalWorkspace {
    return new EvalWorkspace(primitives);
  }

  toPrimitives(): EvalWorkspacePrimitives {
    return this.primitives;
  }
}
