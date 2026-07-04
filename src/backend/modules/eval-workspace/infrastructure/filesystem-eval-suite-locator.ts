import { promises as fs } from "node:fs";
import path from "node:path";

export async function locateSuiteFile(
  workspaceRoot: string,
  suiteId: string,
): Promise<string | undefined> {
  const suitesDirectory = path.join(workspaceRoot, "suites");
  const conventionalFile = path.join(suitesDirectory, suiteId, "suite.json");

  try {
    await fs.access(conventionalFile);
    return conventionalFile;
  } catch {
    // Imported workspaces can use a stable slug for the suite directory.
  }

  const files = await findSuiteFiles(suitesDirectory).catch(() => []);
  for (const file of files) {
    try {
      const value = JSON.parse(await fs.readFile(file, "utf8")) as Record<
        string,
        unknown
      >;
      if (value.suiteId === suiteId) return file;
    } catch {
      // Invalid suites are reported by the workspace reader and cannot match.
    }
  }

  return undefined;
}

async function findSuiteFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) return findSuiteFiles(child);
      if (entry.isFile() && entry.name === "suite.json") return [child];
      return [];
    }),
  );
  return nested.flat();
}
