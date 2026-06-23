import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { evalWorkspaceModule } from "@/lib/container";
import { ThemeToggle } from "@/frontend/components/shared/theme-toggle";
import { RunsWorkspace } from "@/frontend/features/runs/components/runs-workspace";
import { Button } from "@/frontend/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshot = (
    await evalWorkspaceModule.getEvalWorkspace.execute()
  ).toPrimitives();

  return (
    <main className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {snapshot.manifest?.workspaceName ?? "No workspace loaded"}
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight">
              Eval Studio
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/" aria-label="Refresh workspace">
                <RefreshCw data-icon="inline-start" />
                Refresh
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <RunsWorkspace snapshot={snapshot} />
    </main>
  );
}
