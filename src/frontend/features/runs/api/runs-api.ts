import type { SaveAnnotationResponse } from "@/app/api/annotations/responses";
import type {
  DeleteCaseResponse,
  UpdateCaseResponse,
} from "@/app/api/cases/[caseId]/responses";
import type { CreateRunResponse } from "@/app/api/runs/responses";
import type { CreateSuiteResponse } from "@/app/api/suites/responses";
import type { DeleteSuiteResponse } from "@/app/api/suites/[suiteId]/responses";
import type { CreateCaseResponse } from "@/app/api/cases/responses";
import type { ProvidersResponse } from "@/app/api/providers/responses";
import type {
  DeleteRunResponse,
  UpdateRunResponse,
} from "@/app/api/runs/[runId]/responses";
import { readJsonResponse } from "@/frontend/api/read-json-response";

const jsonHeaders = { "Content-Type": "application/json" };

export type CreateRunPayload = {
  name: string;
  suiteId: string;
  caseIds: string[];
  provider: string;
  model: string;
  temperature?: number;
};

export type UpdateRunPayload = {
  name?: string;
  notes?: string | null;
};

export type UpdateCasePayload = {
  name?: string;
  note?: string | null;
  input?: Record<string, unknown> | null;
  expectedOutput?: string | null;
  systemInstruction?: string;
  userMessage?: string;
};

export type CreateSuitePayload = { name: string; description?: string };
export type CreateCasePayload = {
  suiteId: string;
  name: string;
  note?: string;
  expectedOutput?: string;
  systemInstruction?: string;
  userMessage: string;
};

export type SaveAnnotationPayload = {
  resultId: string;
  caseId: string;
  runId: string;
  score: number;
  comment?: string;
  tags?: string[];
};

export async function createRun(
  payload: CreateRunPayload,
): Promise<CreateRunResponse> {
  return readJsonResponse<CreateRunResponse>(
    await fetch("/api/runs", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  );
}

export async function createSuite(payload: CreateSuitePayload): Promise<CreateSuiteResponse> {
  return readJsonResponse<CreateSuiteResponse>(await fetch("/api/suites", {
    method: "POST", headers: jsonHeaders, body: JSON.stringify(payload),
  }));
}

export async function deleteSuite(suiteId: string): Promise<DeleteSuiteResponse> {
  return readJsonResponse<DeleteSuiteResponse>(
    await fetch(`/api/suites/${encodeURIComponent(suiteId)}`, {
      method: "DELETE",
    }),
  );
}

export async function createCase(payload: CreateCasePayload): Promise<CreateCaseResponse> {
  return readJsonResponse<CreateCaseResponse>(await fetch("/api/cases", {
    method: "POST", headers: jsonHeaders, body: JSON.stringify(payload),
  }));
}

export async function duplicateCase(caseId: string): Promise<CreateCaseResponse> {
  return readJsonResponse<CreateCaseResponse>(
    await fetch(`/api/cases/${encodeURIComponent(caseId)}/duplicate`, {
      method: "POST",
    }),
  );
}

export async function listProviders(): Promise<ProvidersResponse> {
  return readJsonResponse<ProvidersResponse>(await fetch("/api/providers", { cache: "no-store" }));
}

export async function updateRun(
  runId: string,
  payload: UpdateRunPayload,
): Promise<UpdateRunResponse> {
  return readJsonResponse<UpdateRunResponse>(
    await fetch(`/api/runs/${encodeURIComponent(runId)}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteRun(runId: string): Promise<DeleteRunResponse> {
  return readJsonResponse<DeleteRunResponse>(
    await fetch(`/api/runs/${encodeURIComponent(runId)}`, {
      method: "DELETE",
    }),
  );
}

export async function retryRun(runId: string): Promise<CreateRunResponse> {
  return readJsonResponse<CreateRunResponse>(await fetch(`/api/runs/${encodeURIComponent(runId)}/retry`, {
    method: "POST",
  }));
}

export async function updateCase(
  caseId: string,
  payload: UpdateCasePayload,
): Promise<UpdateCaseResponse> {
  return readJsonResponse<UpdateCaseResponse>(
    await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteCase(caseId: string): Promise<DeleteCaseResponse> {
  return readJsonResponse<DeleteCaseResponse>(
    await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
      method: "DELETE",
    }),
  );
}

export async function saveAnnotation(
  payload: SaveAnnotationPayload,
): Promise<SaveAnnotationResponse> {
  return readJsonResponse<SaveAnnotationResponse>(
    await fetch("/api/annotations", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    }),
  );
}
