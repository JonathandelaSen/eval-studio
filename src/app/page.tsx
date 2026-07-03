import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { ProjectSwitcher } from "./_components/project-switcher";
import { toProjectRegistryResponse } from "./api/projects/responses";
import { Button } from "@/frontend/components/ui/button";
import { RunsWorkspace } from "@/frontend/features/runs/components/runs-workspace";
import { evalWorkspaceModule, projectModule } from "@/lib/container";

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
  const snapshot = (
    await evalWorkspaceModule.getEvalWorkspace.execute({ workspaceRoot })
  ).toPrimitives();

  return (
    <main id="content" tabIndex={-1} className="min-h-svh">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-5 py-5">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">
              {activeProject ? "Evaluation desk" : "Workspace setup"}
            </p>
            <h1 className="mt-1 font-serif text-3xl tracking-tight">Runs overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeProject
                ? "Inspect experiments, results, and human annotations."
                : "Add a project in Settings to begin."}
            </p>
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
      </header>
      <RunsWorkspace snapshot={snapshot} />
    </main>
  );
}
