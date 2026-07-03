import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { ProjectSwitcher } from "./_components/project-switcher";
import { toProjectRegistryResponse } from "./api/projects/responses";
import { Button } from "@/frontend/components/ui/button";
import { RunsWorkspace } from "@/frontend/features/runs/components/runs-workspace";
import { WorkspaceStrip } from "@/frontend/features/runs/components/workspace-strip";
import { evalWorkspaceModule, projectModule } from "@/lib/container";
import { evalExecutionModule } from "@/lib/container";
import { EvalRun } from "@/backend/modules/eval-execution";
import { isRunJobActive } from "@/lib/run-jobs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, activeProject] = await Promise.all([
    projectModule.listProjects.execute(),
    projectModule.getActiveProject.execute(),
  ]);
  const workspaceRoot = activeProject?.toPrimitives().directory;
  const registrySnapshot = toProjectRegistryResponse(
    projects.map((project) => project.toPrimitives()),
  );
  let snapshot = (
    await evalWorkspaceModule.getEvalWorkspace.execute({ workspaceRoot })
  );
  const staleRuns = snapshot.toPrimitives().runs.filter(
    (run) => (run.status === "running" || run.status === "queued") && !isRunJobActive(run.runId),
  );
  if (staleRuns.length > 0) {
    await Promise.all(staleRuns.map((run) =>
      evalExecutionModule.interruptRun(workspaceRoot, EvalRun.fromPrimitives(run)),
    ));
    snapshot = await evalWorkspaceModule.getEvalWorkspace.execute({ workspaceRoot });
  }

  return (
    <main id="content" tabIndex={-1} className="min-h-svh">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {!activeProject && (
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">
                  Workspace setup
                </p>
              )}
              <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-foreground/90">Overview</h1>
              {!activeProject && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a project in Settings to begin.
                </p>
              )}
            </div>
            <div className="flex items-end gap-2">
              <ProjectSwitcher snapshot={registrySnapshot} />
              <Button asChild variant="outline" size="icon">
                <Link href="/" aria-label="Refresh project">
                  <RefreshCw aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          {activeProject && <WorkspaceStrip snapshot={snapshot.toPrimitives()} />}
        </div>
      </header>
      <RunsWorkspace snapshot={snapshot.toPrimitives()} />
    </main>
  );
}
