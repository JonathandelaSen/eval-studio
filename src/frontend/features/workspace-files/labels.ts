export const workspaceFilesLabels = {
  tab: "JSON files",
  eyebrow: "Workspace source",
  title: "Raw JSON editor",
  description:
    "Browse the real directory structure and edit any JSON file exactly as it exists on disk.",
  treeTitle: "Directory",
  treeHint: "Selected project · JSON files only",
  emptyTree: "No JSON files were found in this project.",
  noSelectionTitle: "Choose a JSON file",
  noSelectionBody:
    "Select a file from the directory tree to inspect and edit its raw source.",
  directEditTitle: "Direct disk editing",
  directEditBody:
    "Saving overwrites this file in the selected project. Eval Studio validates the JSON first, but does not reshape or reformat it.",
  rawSource: "Raw JSON source",
  pathLabel: "File path",
  loading: "Loading file",
  loadError: "The workspace files could not be loaded.",
  save: "Save JSON",
  saving: "Saving",
  saved: "Saved to disk",
  unsaved: "Unsaved changes",
  invalid: "Invalid JSON. Fix the syntax before saving.",
  editorHint: "Edit the complete JSON document. Press ⌘S or Ctrl+S to save.",
  confirmDiscard:
    "Discard your unsaved JSON changes and open another file?",
  retry: "Try again",
  collapseDirectory: "Collapse directory",
  expandDirectory: "Expand directory",
  fileCount: "JSON files",
} as const;
