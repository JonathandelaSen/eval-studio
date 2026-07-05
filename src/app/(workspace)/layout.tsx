import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { ProjectSwitcher } from "@/app/_components/project-switcher";
import { Button } from "@/frontend/components/ui/button";
import { WorkspaceStrip } from "@/frontend/features/runs/components/workspace-strip";
import { WorkspaceProvider } from "@/frontend/features/runs/components/workspace-provider";
import { DiagnosticsPanel } from "@/frontend/features/runs/components/diagnostics-panel";
import { getWorkspaceContext } from "./workspace-context";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { registrySnapshot, snapshot, hasActiveProject } =
    await getWorkspaceContext();

  return (
    <main id="content" tabIndex={-1} className="min-h-svh">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {!hasActiveProject && (
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">
                  Workspace setup
                </p>
              )}
              <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-foreground/90">
                Overview
              </h1>
              {!hasActiveProject && (
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
          {hasActiveProject && <WorkspaceStrip snapshot={snapshot} />}
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-4">
        <DiagnosticsPanel diagnostics={snapshot.diagnostics} />
        <WorkspaceProvider snapshot={snapshot}>{children}</WorkspaceProvider>
      </div>
    </main>
  );
}
