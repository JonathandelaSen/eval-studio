import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEntityRegistry,
  eachRepositoryMethodType,
  getBaseTypeName,
  getExpectedAggregateName,
  loadDomainRepositoryFiles,
  location,
} from "./utils.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function findRepositoryAggregateCohesionViolations({ rootDir = repoRoot } = {}) {
  const entities = await buildEntityRegistry(rootDir);
  const repositories = await loadDomainRepositoryFiles(rootDir);

  const violations = [];

  for (const { file, sourceFile } of repositories) {
    const expectedAggregate = getExpectedAggregateName(file);
    const expected = entities.get(expectedAggregate);

    if (!expected || !expected.isAggregateRoot) continue;

    eachRepositoryMethodType(sourceFile, ({ methodName, typeNode, role, node }) => {
      const baseType = getBaseTypeName(typeNode, sourceFile);
      if (!baseType) return;

      const entity = entities.get(baseType);
      if (!entity || !entity.isAggregateRoot) return;

      if (baseType !== expectedAggregate) {
        violations.push({
          file,
          rule: "repository-foreign-aggregate",
          reason: `Repository method "${methodName}" references aggregate root "${baseType}" (${role}), but this repository owns the "${expectedAggregate}" aggregate. Use the "${baseType}Repository" for that aggregate instead.`,
          location: location(sourceFile, node),
        });
      }
    });
  }

  return violations;
}

export function formatRepositoryAggregateCohesionViolations(violations) {
  if (violations.length === 0) return "";

  return [
    "Repository aggregate cohesion violations:",
    ...violations.map((violation) => {
      const loc = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${loc} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const violations = await findRepositoryAggregateCohesionViolations();

  if (violations.length > 0) {
    console.error(formatRepositoryAggregateCohesionViolations(violations));
    process.exitCode = 1;
    return;
  }

  console.log("DDD repository aggregate cohesion check passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
