"use client";

import { FolderKanban, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectRegistryResponse } from "@/app/api/projects/responses";
import { selectProject as selectProjectRequest } from "@/frontend/features/projects/api/projects-api";

export function ProjectSwitcher({ snapshot }: { snapshot: ProjectRegistryResponse }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (snapshot.projects.length === 0) {
    return (
      <Link
        href="/settings"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-dashed bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      >
        <FolderKanban className="size-4" aria-hidden="true" />
        Add a project
      </Link>
    );
  }

  async function selectProject(projectId: string) {
    setPending(true);
    setError("");
    try {
      await selectProjectRequest(projectId);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not change project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <label htmlFor="active-project" className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Active project
      </label>
      <div className="relative">
        <FolderKanban className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <select
          id="active-project"
          value={snapshot.activeProjectId ?? ""}
          disabled={pending}
          onChange={(event) => selectProject(event.target.value)}
          className="h-10 min-w-56 appearance-none rounded-md border bg-background py-2 pl-9 pr-9 text-sm font-medium shadow-sm disabled:opacity-60"
        >
          {snapshot.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {pending ? (
          <LoaderCircle className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" aria-hidden="true">⌄</span>
        )}
      </div>
      {error ? <p className="mt-1 text-xs text-destructive" role="alert">{error}</p> : null}
    </div>
  );
}
