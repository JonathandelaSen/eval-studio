import type { EvalWorkspacePrimitives } from "@/backend/modules/eval-workspace";

export type EvalWorkspaceResponse = EvalWorkspacePrimitives;

export function toEvalWorkspaceResponse(
  workspace: EvalWorkspacePrimitives,
): EvalWorkspaceResponse {
  return {
    ...workspace,
    suites: [...workspace.suites],
    cases: [...workspace.cases],
    runs: [...workspace.runs],
    results: [...workspace.results],
    annotations: [...workspace.annotations],
    diagnostics: [...workspace.diagnostics],
  };
}
