import type { SaveAnnotationResponse } from "@/app/api/annotations/responses";
import type {
  DeleteCaseResponse,
  UpdateCaseResponse,
} from "@/app/api/cases/[caseId]/responses";
import type { CreateRunResponse } from "@/app/api/runs/responses";
import type {
  DeleteRunResponse,
  UpdateRunResponse,
} from "@/app/api/runs/[runId]/responses";
import { readJsonResponse } from "@/frontend/api/read-json-response";

const jsonHeaders = { "Content-Type": "application/json" };

export type CreateRunPayload = {
  name: string;
  actionId: string;
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
