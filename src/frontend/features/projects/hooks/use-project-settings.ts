"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DirectoryListingResponse } from "@/app/api/directories/responses";
import type { ProjectRegistryResponse } from "@/app/api/projects/responses";
import {
  addProject,
  listDirectories,
  removeProject,
} from "../api/projects-api";

export function useProjectSettings(initialSnapshot: ProjectRegistryResponse) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [listing, setListing] = useState<DirectoryListingResponse | null>(null);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function openDirectory(directory?: string) {
    setLoadingDirectory(true);
    setError("");
    try {
      setListing(await listDirectories(directory));
    } catch (reason) {
      setError(messageFrom(reason, "Could not open directory."));
    } finally {
      setLoadingDirectory(false);
    }
  }

  async function addCurrentDirectory() {
    if (!listing) return false;
    setSaving(true);
    setError("");
    try {
      const project = await addProject(listing.current);
      setSnapshot((current) => {
        const exists = current.projects.some((item) => item.id === project.id);
        return {
          version: 1,
          activeProjectId: project.active
            ? project.id
            : current.activeProjectId,
          projects: exists
            ? current.projects.map((item) =>
                item.id === project.id ? project : item,
              )
            : [...current.projects, project],
        };
      });
      router.refresh();
      return true;
    } catch (reason) {
      setError(messageFrom(reason, "Could not add project."));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove(projectId: string) {
    setError("");
    try {
      setSnapshot(await removeProject(projectId));
      router.refresh();
    } catch (reason) {
      setError(messageFrom(reason, "Could not remove project."));
    }
  }

  return {
    snapshot,
    listing,
    loadingDirectory,
    saving,
    error,
    setListing,
    setError,
    openDirectory,
    addCurrentDirectory,
    removeProject: remove,
  };
}

function messageFrom(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback;
}
