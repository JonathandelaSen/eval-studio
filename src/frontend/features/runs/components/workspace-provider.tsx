"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import {
  useWorkspaceMutations,
  type WorkspaceMutations,
} from "../hooks/use-workspace-mutations";

interface WorkspaceContextValue {
  snapshot: EvalWorkspaceResponse;
  mutations: WorkspaceMutations;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  snapshot,
  children,
}: {
  snapshot: EvalWorkspaceResponse;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const mutations = useWorkspaceMutations();

  React.useEffect(() => {
    if (!snapshot.runs.some((run) => run.status === "queued" || run.status === "running")) {
      return;
    }
    const interval = window.setInterval(() => router.refresh(), 1200);
    return () => window.clearInterval(interval);
  }, [router, snapshot.runs]);

  const value = React.useMemo(
    () => ({ snapshot, mutations }),
    [snapshot, mutations],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {mutations.error ? (
        <p className="mx-auto mb-3 flex max-w-[1600px] items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle aria-hidden="true" className="size-4" />
          {mutations.error}
        </p>
      ) : null}
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
