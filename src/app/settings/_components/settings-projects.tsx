"use client";

import {
  ArrowLeft,
  Check,
  Folder,
  FolderOpen,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/frontend/components/ui/button";
import type { ProjectRegistryResponse } from "@/app/api/projects/responses";
import { useProjectSettings } from "@/frontend/features/projects/hooks/use-project-settings";

export function SettingsProjects({
  initialSnapshot,
}: {
  initialSnapshot: ProjectRegistryResponse;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    snapshot,
    listing,
    loadingDirectory,
    saving,
    error,
    setListing,
    setError,
    openDirectory,
    addCurrentDirectory,
    removeProject,
  } = useProjectSettings(initialSnapshot);

  async function openBrowser() {
    setError("");
    dialogRef.current?.showModal();
    await openDirectory();
  }

  async function addSelectedDirectory() {
    if (await addCurrentDirectory()) {
      dialogRef.current?.close();
    }
  }

  return (
    <section aria-labelledby="projects-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Local sources
          </p>
          <h2 id="projects-heading" className="mt-1 font-serif text-2xl">
            Projects
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each project points to a directory containing evaluation artifacts.
          </p>
        </div>
        <Button type="button" onClick={openBrowser}>
          <Plus className="size-4" aria-hidden="true" />
          Add project
        </Button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {snapshot.projects.length > 0 ? (
        <ul className="mt-5 grid gap-3" role="list">
          {snapshot.projects.map((project) => {
            const active = project.id === snapshot.activeProjectId;
            return (
              <li
                key={project.id}
                className="group grid gap-3 rounded-lg border bg-card p-4 shadow-[0_1px_0_hsl(var(--border))] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <FolderOpen className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{project.name}</h3>
                    {active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-primary">
                        <Check className="size-3" aria-hidden="true" /> Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={project.root}>
                    {project.root}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${project.name}`}
                  onClick={() => removeProject(project.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-5 grid min-h-64 place-items-center rounded-lg border border-dashed bg-[radial-gradient(circle_at_center,hsl(var(--muted))_1px,transparent_1px)] [background-size:18px_18px]">
          <div className="max-w-sm bg-background/90 p-6 text-center backdrop-blur-sm">
            <span className="mx-auto grid size-12 place-items-center rounded-full border bg-card text-muted-foreground">
              <Folder className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-serif text-lg">No projects connected</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Choose the local folder where a project keeps its manifest, suites, runs, and annotations.
            </p>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="directory-dialog-title"
        onClose={() => setListing(null)}
        className="m-auto w-[min(44rem,calc(100%-2rem))] rounded-xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-[#07110d]/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-primary">Directory browser</p>
            <h2 id="directory-dialog-title" className="mt-1 font-serif text-xl">Choose a project folder</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close directory browser" onClick={() => dialogRef.current?.close()}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="border-b bg-muted/35 px-5 py-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Open parent directory" disabled={!listing?.parent || loadingDirectory} onClick={() => listing?.parent && openDirectory(listing.parent)}>
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Button>
            <div className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
              <span className="block truncate">{listing?.current ?? "Opening home directory…"}</span>
            </div>
          </div>
        </div>

        <div className="h-80 overflow-y-auto p-3">
          {loadingDirectory ? (
            <div className="grid h-full place-items-center text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" aria-label="Loading directory" />
            </div>
          ) : listing?.directories.length ? (
            <ul className="grid gap-1" role="list">
              {listing.directories.map((directory) => (
                <li key={directory.path}>
                  <button type="button" onClick={() => openDirectory(directory.path)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted">
                    <Folder className="size-4 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                    <span className="truncate">{directory.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">This folder has no subdirectories.</div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
          <p className="text-xs text-muted-foreground">Select the folder currently shown above.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>Cancel</Button>
            <Button type="button" disabled={!listing || saving || loadingDirectory} onClick={addSelectedDirectory}>
              {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
              {saving ? "Adding…" : "Use this folder"}
            </Button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
