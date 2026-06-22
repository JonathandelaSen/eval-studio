import { z } from "zod";

const jsonRecord = z.record(z.unknown());

export const capturedPromptSchema = z.object({
  format: z.string(),
}).passthrough();

export const runtimeSchema = z.object({
  provider: z.string(),
  model: z.string(),
  temperature: z.number().optional(),
}).passthrough();

export const manifestSchema = z.object({
  schemaVersion: z.literal("1"),
  workspaceName: z.string(),
  createdAt: z.string(),
}).passthrough();

export const suiteSchema = z.object({
  schemaVersion: z.literal("1"),
  suiteId: z.string(),
  actionId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  caseIds: z.array(z.string()),
}).passthrough();

export const caseSchema = z.object({
  schemaVersion: z.literal("1"),
  caseId: z.string(),
  actionId: z.string(),
  name: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
  createdBy: jsonRecord.optional(),
  input: jsonRecord.optional(),
  promptTemplate: capturedPromptSchema.optional(),
  promptVariables: jsonRecord.optional(),
  renderedPrompt: capturedPromptSchema,
  runtime: runtimeSchema.optional(),
  expectedOutput: jsonRecord.optional(),
  source: jsonRecord.optional(),
}).passthrough();

export const runSchema = z.object({
  schemaVersion: z.literal("1"),
  runId: z.string(),
  name: z.string(),
  actionId: z.string(),
  producer: z.string(),
  createdAt: z.string(),
  caseIds: z.array(z.string()),
  runtime: runtimeSchema.optional(),
  executionMode: z.string().optional(),
  notes: z.string().optional(),
  suiteId: z.string().optional(),
}).passthrough();

export const resultSchema = z.object({
  schemaVersion: z.literal("1"),
  resultId: z.string(),
  caseId: z.string(),
  runId: z.string(),
  producer: z.string(),
  createdAt: z.string(),
  runtime: runtimeSchema.optional(),
  promptVariables: jsonRecord.optional(),
  renderedPrompt: capturedPromptSchema,
  rawOutput: z.unknown().nullable(),
  parsedOutput: z.unknown().nullable(),
  status: z.enum(["completed", "failed"]),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
    })
    .nullable(),
  usage: jsonRecord.nullable().optional(),
  latencyMs: z.number().nullable().optional(),
}).passthrough();

export const annotationSchema = z.object({
  schemaVersion: z.literal("1"),
  resultId: z.string(),
  caseId: z.string(),
  runId: z.string(),
  updatedAt: z.string(),
  score: z.number().min(0).max(5),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).passthrough();

export type EvalManifest = z.infer<typeof manifestSchema>;
export type EvalSuite = z.infer<typeof suiteSchema>;
export type EvalCase = z.infer<typeof caseSchema>;
export type EvalRun = z.infer<typeof runSchema>;
export type EvalResult = z.infer<typeof resultSchema>;
export type EvalAnnotation = z.infer<typeof annotationSchema>;

export type WorkspaceDiagnostic = {
  path: string;
  message: string;
};

export type EvalWorkspaceSnapshot = {
  workspaceRoot: string | null;
  manifest: EvalManifest | null;
  suites: EvalSuite[];
  cases: EvalCase[];
  runs: EvalRun[];
  results: EvalResult[];
  annotations: EvalAnnotation[];
  diagnostics: WorkspaceDiagnostic[];
};
