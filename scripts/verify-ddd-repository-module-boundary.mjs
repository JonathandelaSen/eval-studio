import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEntityRegistry,
  eachRepositoryMethodType,
  getBaseTypeName,
  loadDomainRepositoryFiles,
  location,
  moduleOf,
} from "./utils.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function findRepositoryModuleBoundaryViolations({ rootDir = repoRoot } = {}) {
  const entities = await buildEntityRegistry(rootDir);
  const repositories = await loadDomainRepositoryFiles(rootDir);

  const violations = [];

  for (const { file, sourceFile } of repositories) {
    const repoModule = moduleOf(file);

    eachRepositoryMethodType(sourceFile, ({ methodName, typeNode, role, node }) => {
      const baseType = getBaseTypeName(typeNode, sourceFile);
      if (!baseType) return;

      const entity = entities.get(baseType);
      if (!entity) return;

      if (entity.module !== repoModule) {
        violations.push({
          file,
          rule: "repository-cross-module-entity",
          reason: `Repository method "${methodName}" references entity "${baseType}" (${role}) from module "${entity.module}", but the repository lives in module "${repoModule}". Repositories must only reference entities from their own module.`,
          location: location(sourceFile, node),
        });
      }
    });
  }

  return violations;
}

export function formatRepositoryModuleBoundaryViolations(violations) {
  if (violations.length === 0) return "";

  return [
    "Repository module boundary violations:",
    ...violations.map((violation) => {
      const loc = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${loc} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const violations = await findRepositoryModuleBoundaryViolations();

  if (violations.length > 0) {
    console.error(formatRepositoryModuleBoundaryViolations(violations));
    process.exitCode = 1;
    return;
  }

  console.log("DDD repository module boundary check passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
