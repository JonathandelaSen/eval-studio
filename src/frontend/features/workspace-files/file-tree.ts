export type WorkspaceFileTreeNode =
  | { kind: "file"; name: string; path: string }
  | {
      kind: "directory";
      name: string;
      path: string;
      children: WorkspaceFileTreeNode[];
    };

type MutableDirectory = {
  kind: "directory";
  name: string;
  path: string;
  children: Map<string, MutableDirectory | WorkspaceFileTreeNode>;
};

export function buildFileTree(paths: string[]): WorkspaceFileTreeNode[] {
  const root: MutableDirectory = {
    kind: "directory",
    name: "",
    path: "",
    children: new Map(),
  };

  for (const filePath of paths) {
    const segments = filePath.split("/");
    let parent = root;
    segments.forEach((name, index) => {
      const nodePath = segments.slice(0, index + 1).join("/");
      const isFile = index === segments.length - 1;
      if (isFile) {
        parent.children.set(name, { kind: "file", name, path: nodePath });
        return;
      }
      const current = parent.children.get(name);
      if (current?.kind === "directory" && "children" in current) {
        parent = current as MutableDirectory;
        return;
      }
      const directory: MutableDirectory = {
        kind: "directory",
        name,
        path: nodePath,
        children: new Map(),
      };
      parent.children.set(name, directory);
      parent = directory;
    });
  }

  return finalize(root);
}

function finalize(directory: MutableDirectory): WorkspaceFileTreeNode[] {
  return [...directory.children.values()]
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "file" ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((node) =>
      node.kind === "directory" && "children" in node
        ? { ...node, children: finalize(node as MutableDirectory) }
        : (node as WorkspaceFileTreeNode),
    );
}
