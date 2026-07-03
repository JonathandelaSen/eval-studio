"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, FileJson2, Folder } from "lucide-react";
import { cn } from "@/frontend/utils/cn";
import { buildFileTree, type WorkspaceFileTreeNode } from "../file-tree";
import { workspaceFilesLabels } from "../labels";

export function WorkspaceFileTree({
  files,
  selectedPath,
  onSelect,
}: {
  files: string[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const tree = React.useMemo(() => buildFileTree(files), [files]);

  return (
    <nav aria-label={workspaceFilesLabels.treeTitle} className="py-2">
      <ul className="space-y-0.5">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  );
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: WorkspaceFileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const inset = { paddingLeft: `${0.625 + depth * 1.05}rem` };

  if (node.kind === "file") {
    return (
      <li>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left font-mono text-xs transition-colors",
            selectedPath === node.path
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground/78 hover:bg-muted hover:text-foreground",
          )}
          style={inset}
          onClick={() => onSelect(node.path)}
        >
          <FileJson2 aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        style={inset}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={`${open ? workspaceFilesLabels.collapseDirectory : workspaceFilesLabels.expandDirectory}: ${node.name}`}
      >
        {open ? (
          <ChevronDown aria-hidden="true" className="size-3.5" />
        ) : (
          <ChevronRight aria-hidden="true" className="size-3.5" />
        )}
        <Folder aria-hidden="true" className="size-3.5 text-primary" />
        <span className="truncate">{node.name}</span>
      </button>
      {open ? (
        <ul>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
