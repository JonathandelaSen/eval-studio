import { cache } from "react";
import { EvalRun } from "@/backend/modules/eval-execution";
import {
  evalExecutionModule,
  evalWorkspaceModule,
  projectModule,
} from "@/lib/container";
import { isRunJobActive } from "@/lib/run-jobs";
import { toProjectRegistryResponse } from "@/app/api/projects/responses";
import type { ProjectRegistryResponse } from "@/app/api/projects/responses";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";

export interface WorkspaceContext {
  registrySnapshot: ProjectRegistryResponse;
  snapshot: EvalWorkspaceResponse;
  hasActiveProject: boolean;
  workspaceRoot: string | undefined;
}

export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext> => {
  const [projects, activeProject] = await Promise.all([
    projectModule.listProjects.execute(),
    projectModule.getActiveProject.execute(),
  ]);
  const workspaceRoot = activeProject?.toPrimitives().directory;
  const registrySnapshot = toProjectRegistryResponse(
    projects.map((project) => project.toPrimitives()),
  );

  let snapshot = await evalWorkspaceModule.getEvalWorkspace.execute({ workspaceRoot });
  const staleRuns = snapshot
    .toPrimitives()
    .runs.filter(
      (run) =>
        (run.status === "running" || run.status === "queued") &&
        !isRunJobActive(run.runId),
    );
  if (staleRuns.length > 0) {
    await Promise.all(
      staleRuns.map((run) =>
        evalExecutionModule.interruptRun(workspaceRoot, EvalRun.fromPrimitives(run)),
      ),
    );
    snapshot = await evalWorkspaceModule.getEvalWorkspace.execute({ workspaceRoot });
  }

  return {
    registrySnapshot,
    snapshot: snapshot.toPrimitives(),
    hasActiveProject: Boolean(activeProject),
    workspaceRoot,
  };
});
