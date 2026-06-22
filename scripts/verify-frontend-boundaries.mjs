import { readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const frontendRoots = ["src/frontend/features", "src/frontend"];
const responseFiles = "src/app/api/**/responses.ts";
const restrictedPrimitiveRoots = ["src/app", "src/frontend/components", "src/frontend/features", "src/frontend"];

const restrictedPrimitiveImports = [
  {
    name: "Badge primitive",
    modulePath: "src/frontend/components/ui/badge.tsx",
    allowedImporters: ["src/frontend/components/shared/label-badge.tsx"],
    replacement: "@/frontend/components/shared/label-badge",
  },
];

function listFiles(patterns) {
  const result = spawnSync("rg", ["--files", ...patterns], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0 && !result.stdout.trim()) return [];
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractImports(source) {
  const imports = [];
  const patterns = [
    /import\s+(?:type\s+)?[\s\S]*?\s+from\s+["']([^"']+)["']/g,
    /export\s+(?:type\s+)?[\s\S]*?\s+from\s+["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.push(match[1]);
    }
  }
  return imports;
}

function normalizePath(filePath) {
  return filePath.split(/[\\/]/).join("/");
}

function withoutKnownExtension(filePath) {
  return filePath.replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, "");
}

function resolveImportPath(importer, specifier) {
  if (specifier.startsWith("@/")) {
    return withoutKnownExtension(`src/${specifier.slice(2)}.tsx`);
  }

  if (specifier.startsWith("src/")) {
    return withoutKnownExtension(specifier);
  }

  if (specifier.startsWith(".")) {
    const resolved = normalize(join(dirname(importer), specifier));
    return withoutKnownExtension(normalizePath(resolved));
  }

  return null;
}

function featureName(filePath) {
  const parts = filePath.split("/");
  return parts[0] === "src" && parts[1] === "features" ? parts[2] : null;
}

const violations = [];
const frontendFiles = listFiles(
  frontendRoots.flatMap((dir) => ["-g", `${dir}/**/*.{ts,tsx}`])
);

for (const file of frontendFiles) {
  const source = readFileSync(join(root, file), "utf8");
  const imports = extractImports(source);
  const currentFeature = featureName(file);

  for (const specifier of imports) {
    if (
      specifier.startsWith("@/backend/modules/") ||
      specifier.startsWith("src/backend/modules/")
    ) {
      violations.push(`${file}: frontend must not import modules (${specifier})`);
    }

    if (
      /^@\/app\/api\/.*\/route$/.test(specifier) ||
      /^src\/app\/api\/.*\/route$/.test(specifier)
    ) {
      violations.push(`${file}: frontend must not import API route files (${specifier})`);
    }

    const featureMatch = specifier.match(/^@\/features\/([^/]+)(?:\/(.+))?$/);
    if (
      featureMatch &&
      currentFeature &&
      featureMatch[1] !== currentFeature &&
      featureMatch[2] &&
      featureMatch[2] !== "index"
    ) {
      violations.push(
        `${file}: cross-feature import must use the feature barrel (${specifier})`
      );
    }
  }
}

const forbiddenResponseImports = [
  "next/server",
  "server-only",
  "@supabase/",
  "@/lib/container",
  "@/app/api/_shared/auth/request-context",
  "/infrastructure/",
];

for (const file of listFiles(["-g", responseFiles])) {
  const source = readFileSync(join(root, file), "utf8");
  for (const specifier of extractImports(source)) {
    if (forbiddenResponseImports.some((forbidden) => specifier.includes(forbidden))) {
      violations.push(
        `${file}: responses.ts must be frontend-import-safe (${specifier})`
      );
    }
  }
}

const restrictedPrimitiveFiles = listFiles(
  restrictedPrimitiveRoots.flatMap((dir) => ["-g", `${dir}/**/*.{ts,tsx}`])
);

for (const file of restrictedPrimitiveFiles) {
  const source = readFileSync(join(root, file), "utf8");
  for (const specifier of extractImports(source)) {
    const resolvedImport = resolveImportPath(file, specifier);
    if (!resolvedImport) continue;

    for (const rule of restrictedPrimitiveImports) {
      const restrictedPath = withoutKnownExtension(rule.modulePath);
      const allowedImporters = new Set(rule.allowedImporters);
      if (resolvedImport !== restrictedPath || allowedImporters.has(file)) continue;

      violations.push(
        `${file}: ${rule.name} must only be imported by ${rule.allowedImporters.join(", ")}; use ${rule.replacement} instead (${specifier})`
      );
    }
  }
}

if (violations.length > 0) {
  console.error("Frontend boundary violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(
  `Frontend boundaries OK (${frontendFiles.length} frontend files, ${
    listFiles(["-g", responseFiles]).length
  } response files).`
);
