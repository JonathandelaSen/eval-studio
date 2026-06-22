import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const routePattern = "src/app/api/**/route.ts";
const requiredRouteSiblings = ["validation.ts", "responses.ts"];
const actionDispatchPattern =
  /\b(?:if|switch)\s*\(\s*[^)]*\.(action|command|operation)\b[^)]*\)/g;

// Remove entries as their action-based controllers are split into dedicated routes.
const temporaryAllowlist = new Set([
  "src/app/api/cvs/[id]/chat/route.ts",
  "src/app/api/job-match-analyses/[id]/chat/route.ts",
]);

function listRouteFiles() {
  const result = spawnSync("rg", ["--files", "-g", routePattern], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0 && !result.stdout.trim()) return [];

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

const routeFiles = listRouteFiles();
const violations = [];

for (const file of routeFiles) {
  const routeDir = dirname(file);
  for (const sibling of requiredRouteSiblings) {
    if (!existsSync(join(root, routeDir, sibling))) {
      violations.push(
        `${file}: API route must have sibling ${sibling}.`,
      );
    }
  }

  if (temporaryAllowlist.has(file)) continue;

  const source = readFileSync(join(root, file), "utf8");
  for (const match of source.matchAll(actionDispatchPattern)) {
    violations.push(
      `${file}:${lineNumberAt(source, match.index)}: API controllers must not dispatch commands based on "${match[1]}"; create a dedicated route for each command.`,
    );
  }
}

if (violations.length > 0) {
  console.error("API controller architecture violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(
  `API controllers OK (${routeFiles.length} routes, ${temporaryAllowlist.size} temporary allowlist entries).`,
);
