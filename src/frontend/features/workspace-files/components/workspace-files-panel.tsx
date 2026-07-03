"use client";

import { AlertCircle, FileJson2, FolderTree, ShieldAlert } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { useWorkspaceJsonFiles } from "../hooks/use-workspace-json-files";
import { workspaceFilesLabels } from "../labels";
import { WorkspaceFileTree } from "./workspace-file-tree";
import { WorkspaceJsonEditor } from "./workspace-json-editor";

export function WorkspaceFilesPanel({ active }: { active: boolean }) {
  const files = useWorkspaceJsonFiles(active);

  function selectFile(path: string) {
    if (
      files.dirty &&
      !window.confirm(workspaceFilesLabels.confirmDiscard)
    ) {
      return;
    }
    void files.openFile(path);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div className="max-w-3xl">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">
            {workspaceFilesLabels.eyebrow}
          </p>
          <h2 className="mt-1 font-sans text-xl font-bold tracking-tight text-foreground/90">
            {workspaceFilesLabels.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {workspaceFilesLabels.description}
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <FileJson2 aria-hidden="true" className="size-3.5 text-primary" />
          {files.files.length} {workspaceFilesLabels.fileCount}
        </p>
      </header>

      <aside className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 text-sm">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold">{workspaceFilesLabels.directEditTitle}</p>
          <p className="mt-0.5 text-muted-foreground">
            {workspaceFilesLabels.directEditBody}
          </p>
        </div>
      </aside>

      {files.error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="flex items-center gap-2">
            <AlertCircle aria-hidden="true" className="size-4" />
            {files.error}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void files.loadFiles()}>
            {workspaceFilesLabels.retry}
          </Button>
        </div>
      ) : null}

      <div className="grid min-h-[620px] grid-cols-1 items-stretch gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-hidden rounded-lg border bg-card">
          <div className="border-b bg-muted/45 px-3 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FolderTree aria-hidden="true" className="size-4 text-primary" />
              {workspaceFilesLabels.treeTitle}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {workspaceFilesLabels.treeHint}
            </p>
          </div>
          <div className="max-h-[560px] overflow-auto px-1.5">
            {files.files.length ? (
              <WorkspaceFileTree
                files={files.files}
                selectedPath={files.selectedPath}
                onSelect={selectFile}
              />
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {files.loading
                  ? workspaceFilesLabels.loading
                  : workspaceFilesLabels.emptyTree}
              </p>
            )}
          </div>
        </aside>

        {files.selectedPath ? (
          <WorkspaceJsonEditor
            path={files.selectedPath}
            content={files.content}
            dirty={files.dirty}
            saving={files.saving}
            saved={files.saved}
            loading={files.loading}
            onChange={files.setContent}
            onSave={() => void files.save()}
          />
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed bg-card/40 px-6 text-center">
            <FileJson2 aria-hidden="true" className="size-8 text-muted-foreground/60" />
            <h3 className="mt-3 font-sans font-bold text-base text-foreground/90">
              {workspaceFilesLabels.noSelectionTitle}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {workspaceFilesLabels.noSelectionBody}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
