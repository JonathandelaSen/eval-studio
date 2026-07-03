"use client";

import { AlertTriangle, Check, Code2, Save } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/utils/cn";
import { workspaceFilesLabels } from "../labels";

export function WorkspaceJsonEditor({
  path,
  content,
  dirty,
  saving,
  saved,
  loading,
  onChange,
  onSave,
}: {
  path: string;
  content: string;
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  loading: boolean;
  onChange: (content: string) => void;
  onSave: () => void;
}) {
  const valid = isValidJson(content);

  return (
    <section className="flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-lg border bg-[#111512] text-zinc-100 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.7)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#171d19] px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-emerald-300/75">
            <Code2 aria-hidden="true" className="size-3.5" />
            {workspaceFilesLabels.rawSource}
          </p>
          <p
            className="mt-1 truncate font-mono text-sm text-zinc-100"
            title={path}
            aria-label={`${workspaceFilesLabels.pathLabel}: ${path}`}
          >
            {path}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EditorStatus dirty={dirty} saved={saved} valid={valid} />
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={!dirty || !valid || saving || loading}
            className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
          >
            {saving ? (
              workspaceFilesLabels.saving
            ) : (
              <>
                <Save data-icon="inline-start" />
                {workspaceFilesLabels.save}
              </>
            )}
          </Button>
        </div>
      </header>
      <p className="border-b border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-zinc-400">
        {workspaceFilesLabels.editorHint}
      </p>
      <textarea
        aria-label={workspaceFilesLabels.rawSource}
        aria-invalid={!valid}
        aria-describedby="raw-json-validation"
        value={content}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            if (dirty && valid && !saving) onSave();
          }
        }}
        spellCheck={false}
        className={cn(
          "min-h-[520px] flex-1 resize-y bg-transparent px-5 py-4 font-mono text-[13px] leading-6 text-zinc-100 outline-none placeholder:text-zinc-600",
          !valid && "bg-red-950/10",
        )}
      />
      <div
        id="raw-json-validation"
        aria-live="polite"
        className={cn(
          "flex min-h-9 items-center border-t border-white/10 px-4 text-xs",
          valid ? "text-zinc-500" : "bg-red-950/30 text-red-300",
        )}
      >
        {!valid ? (
          <>
            <AlertTriangle aria-hidden="true" className="mr-2 size-3.5" />
            {workspaceFilesLabels.invalid}
          </>
        ) : null}
      </div>
    </section>
  );
}

function EditorStatus({
  dirty,
  saved,
  valid,
}: {
  dirty: boolean;
  saved: boolean;
  valid: boolean;
}) {
  if (dirty) {
    return (
      <span className={cn("text-xs", valid ? "text-amber-300" : "text-red-300")}>
        {workspaceFilesLabels.unsaved}
      </span>
    );
  }
  if (saved) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-300">
        <Check aria-hidden="true" className="size-3.5" />
        {workspaceFilesLabels.saved}
      </span>
    );
  }
  return null;
}

function isValidJson(content: string) {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}
