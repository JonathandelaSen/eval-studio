import * as React from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/frontend/api/read-json-response";
import {
  createRun,
  createSuite,
  createCase,
  deleteCase,
  deleteRun,
  saveAnnotation,
  updateCase,
  updateRun,
  retryRun,
  type CreateRunPayload,
  type CreateSuitePayload,
  type CreateCasePayload,
  type SaveAnnotationPayload,
  type UpdateCasePayload,
  type UpdateRunPayload,
} from "../api/runs-api";
import { runsLabels } from "../labels";

export function useWorkspaceMutations() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const perform = React.useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T | null> => {
      setBusy(true);
      setError(null);
      try {
        const value = await operation();
        router.refresh();
        return value;
      } catch (caught) {
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : runsLabels.errors.mutationFailed,
        );
        return null;
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  return {
    busy,
    error,
    createRun: (payload: CreateRunPayload) => perform(() => createRun(payload)),
    createSuite: (payload: CreateSuitePayload) => perform(() => createSuite(payload)),
    createCase: (payload: CreateCasePayload) => perform(() => createCase(payload)),
    updateRun: (runId: string, payload: UpdateRunPayload) =>
      perform(() => updateRun(runId, payload)),
    deleteRun: (runId: string) => perform(() => deleteRun(runId)),
    retryRun: (runId: string) => perform(() => retryRun(runId)),
    updateCase: (caseId: string, payload: UpdateCasePayload) =>
      perform(() => updateCase(caseId, payload)),
    deleteCase: (caseId: string) => perform(() => deleteCase(caseId)),
    saveAnnotation: (payload: SaveAnnotationPayload) =>
      perform(() => saveAnnotation(payload)),
  };
}

export type WorkspaceMutations = ReturnType<typeof useWorkspaceMutations>;
