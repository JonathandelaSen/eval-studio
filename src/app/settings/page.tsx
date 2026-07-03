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
          <h1 className="font-serif text-3xl tracking-tight">Settings</h1>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-8">
        <SettingsProjects initialSnapshot={snapshot} />
      </div>
    </main>
  );
}
