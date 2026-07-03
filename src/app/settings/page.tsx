import { SettingsProjects } from "./_components/settings-projects";
import { toProjectRegistryResponse } from "@/app/api/projects/responses";
import { projectModule } from "@/lib/container";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const projects = await projectModule.listProjects.execute();
  const snapshot = toProjectRegistryResponse(
    projects.map((project) => project.toPrimitives()),
  );

  return (
    <main id="content" tabIndex={-1} className="min-h-svh">
      <header className="border-b bg-card/70">
        <div className="mx-auto max-w-5xl px-5 py-7">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">
            Preferences
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Connect local evaluation directories once, then move between them from the overview.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-8">
        <SettingsProjects initialSnapshot={snapshot} />
      </div>
    </main>
  );
}
