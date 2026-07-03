import * as React from "react";
import { ApiClientError } from "@/frontend/api/read-json-response";
import {
  getWorkspaceFile,
  listWorkspaceFiles,
  saveWorkspaceFile,
} from "../api/workspace-files-api";
import { workspaceFilesLabels } from "../labels";
import { shouldLoadWorkspaceFiles } from "../loading-state";

interface WorkspaceFilesState {
  files: string[];
  selectedPath: string | null;
  content: string;
  savedContent: string;
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

const initialState: WorkspaceFilesState = {
  files: [],
  selectedPath: null,
  content: "",
  savedContent: "",
  loading: false,
  loaded: false,
  saving: false,
  saved: false,
  error: null,
};

export function useWorkspaceJsonFiles(active: boolean) {
  const [state, setState] = React.useState(initialState);

  const openFile = React.useCallback(async (path: string) => {
    setState((current) => ({
      ...current,
      selectedPath: path,
      loading: true,
      saved: false,
      error: null,
    }));
    try {
      const file = await getWorkspaceFile(path);
      setState((current) => ({
        ...current,
        selectedPath: file.path,
        content: file.content,
        savedContent: file.content,
        loading: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: errorMessage(error),
      }));
    }
  }, []);

  const loadFiles = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await listWorkspaceFiles();
      setState((current) => ({
        ...current,
        files: response.files,
        loading: false,
        loaded: true,
      }));
      const first = response.files.includes("manifest.json")
        ? "manifest.json"
        : response.files[0];
      if (first) await openFile(first);
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: errorMessage(error),
      }));
    }
  }, [openFile]);

  React.useEffect(() => {
    if (
      shouldLoadWorkspaceFiles({
        active,
        loaded: state.loaded,
        loading: state.loading,
      }) &&
      !state.error
    ) {
      void loadFiles();
    }
  }, [active, loadFiles, state.error, state.loaded, state.loading]);

  const save = React.useCallback(async () => {
    if (!state.selectedPath) return false;
    setState((current) => ({ ...current, saving: true, saved: false, error: null }));
    try {
      const file = await saveWorkspaceFile(state.selectedPath, state.content);
      setState((current) => ({
        ...current,
        content: file.content,
        savedContent: file.content,
        saving: false,
        saved: true,
      }));
      return true;
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: errorMessage(error),
      }));
      return false;
    }
  }, [state.content, state.selectedPath]);

  return {
    ...state,
    dirty: state.content !== state.savedContent,
    setContent: (content: string) =>
      setState((current) => ({ ...current, content, saved: false })),
    openFile,
    loadFiles,
    save,
  };
}

function errorMessage(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : workspaceFilesLabels.loadError;
}

export type WorkspaceJsonFilesController = ReturnType<
  typeof useWorkspaceJsonFiles
>;
