import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const allowedSuffixes = [
  "Repository",
  "Service",
  "Factory",
  "Criteria",
  "SearchCriteria",
  "Input",
  "Reader",
  "Writer",
];

async function walkFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      files.push(...(await walkFiles(entryPath)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".ts")) files.push(entryPath);
  }
  return files;
}

function toPosixRelative(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function parseSource(source, fileName) {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
}

function location(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${line + 1}:${character + 1}`;
}

function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function getExpectedPascalCaseName(fileName) {
  const base = path.basename(fileName);
  const prefix = base.replace(/\.repository\.ts$/, "").replace(/\.ts$/, "");
  return toPascalCase(prefix);
}

function getBaseTypeName(typeNode, sourceFile) {
  if (!typeNode) return null;

  const kind = typeNode.kind;
  if (
    kind === ts.SyntaxKind.VoidKeyword ||
    kind === ts.SyntaxKind.BooleanKeyword ||
    kind === ts.SyntaxKind.StringKeyword ||
    kind === ts.SyntaxKind.NumberKeyword ||
    kind === ts.SyntaxKind.NullKeyword ||
    kind === ts.SyntaxKind.UndefinedKeyword
  ) {
    return typeNode.getText(sourceFile);
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText(sourceFile);
    if (name === "Promise" || name === "Set" || name === "Array" || name === "Map") {
      if (typeNode.typeArguments && typeNode.typeArguments.length > 0) {
        return getBaseTypeName(typeNode.typeArguments[0], sourceFile);
      }
      return null;
    }
    return name;
  }

  if (ts.isArrayTypeNode(typeNode)) {
    return getBaseTypeName(typeNode.elementType, sourceFile);
  }

  if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
    for (const childType of typeNode.types) {
      if (
        childType.kind === ts.SyntaxKind.NullKeyword ||
        childType.kind === ts.SyntaxKind.UndefinedKeyword
      ) {
        continue;
      }
      const base = getBaseTypeName(childType, sourceFile);
      if (base) return base;
    }
  }

  if (ts.isLiteralTypeNode(typeNode)) {
    if (typeNode.literal.kind === ts.SyntaxKind.NullKeyword) return null;
    return typeNode.getText(sourceFile);
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    return "inline-object";
  }

  return null;
}

export async function findRepositoryReturnTypesViolations({ rootDir = repoRoot } = {}) {
  const modulesDir = path.join(rootDir, "src/backend/modules");
  const allFiles = await walkFiles(modulesDir);
  const repositoryFiles = allFiles
    .map((filePath) => toPosixRelative(rootDir, filePath))
    .filter(
      (file) =>
        (file.includes("/domain/repositories/") || file.includes("/infrastructure/repositories/")) &&
        file.endsWith(".repository.ts")
    )
    .sort();

  const violations = [];

  for (const file of repositoryFiles) {
    const content = await readFile(path.join(rootDir, file), "utf8");
    const sourceFile = parseSource(content, file);
    const expectedPascalCaseName = getExpectedPascalCaseName(file);
    const isInfrastructure = file.includes("/infrastructure/repositories/");

    // Map named imports to their module specifiers
    const imports = new Map();
    sourceFile.statements.forEach((node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, "");
        if (node.importClause) {
          if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach((element) => {
              imports.set(element.name.text, moduleSpecifier);
            });
          }
          if (node.importClause.name) {
            imports.set(node.importClause.name.text, moduleSpecifier);
          }
        }
      }
    });

    sourceFile.statements.forEach((node) => {
      // 1. Check declarations in the file
      let declaredName = null;
      let targetNode = null;

      if (ts.isInterfaceDeclaration(node)) {
        declaredName = node.name.text;
        targetNode = node.name;
      } else if (ts.isTypeAliasDeclaration(node)) {
        declaredName = node.name.text;
        targetNode = node.name;
      }

      if (declaredName && targetNode) {
        if (isInfrastructure) {
          const allowedInfraSuffixes = ["Row", "Input", "Filters"];
          const isAllowedInfraDecl =
            declaredName === "Row" ||
            allowedInfraSuffixes.some((suffix) => declaredName.endsWith(suffix));
          if (!isAllowedInfraDecl) {
            violations.push({
              file,
              rule: "repository-infrastructure-invalid-declaration",
              reason: `Infrastructure repository files must only define Row mapping, Input, or Filters types or interfaces (e.g. ending with "Row", "Input", "Filters" or named "Row"). The type/interface "${declaredName}" is not allowed.`,
              location: location(sourceFile, targetNode),
            });
          }
        } else {
          const hasAllowedSuffix = allowedSuffixes.some((suffix) => declaredName.endsWith(suffix));
          const matchesPascalCasePrefix = declaredName === expectedPascalCaseName;

          if (!hasAllowedSuffix && !matchesPascalCasePrefix) {
            violations.push({
              file,
              rule: "repository-invalid-declaration-type",
              reason: `Repository interface files must only define/export the repository/service interface itself, or input/criteria structures. The type/interface "${declaredName}" is not allowed. Return value objects or entities instead.`,
              location: location(sourceFile, targetNode),
            });
          }
        }
      }

      // 2. Check method return types inside repository/service interfaces
      if (!isInfrastructure && ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.text;
        const isRepositoryOrService =
          interfaceName.endsWith("Repository") ||
          interfaceName.endsWith("Service") ||
          interfaceName.endsWith("Reader") ||
          interfaceName.endsWith("Writer") ||
          interfaceName === expectedPascalCaseName;

        if (isRepositoryOrService) {
          node.members.forEach((member) => {
            if (ts.isMethodSignature(member)) {
              const methodName = member.name.getText(sourceFile);
              const baseType = getBaseTypeName(member.type, sourceFile);

              if (baseType) {
                const isPrimitive = ["void", "boolean", "string", "number", "null", "undefined"].includes(
                  baseType
                );
                if (isPrimitive) {
                  return;
                }

                if (baseType === "inline-object") {
                  violations.push({
                    file,
                    rule: "repository-invalid-return-type",
                    reason: `Repository method "${interfaceName}.${methodName}" returns an inline object structure. Repository methods must return Value Objects or Entities.`,
                    location: location(sourceFile, member),
                  });
                  return;
                }

                // A Factory method is allowed to return another Service/Repository/Reader/Writer
                const isFactoryMethod =
                  interfaceName.endsWith("Factory") &&
                  (baseType.endsWith("Service") ||
                    baseType.endsWith("Repository") ||
                    baseType.endsWith("Reader") ||
                    baseType.endsWith("Writer"));
                if (isFactoryMethod) {
                  return;
                }

                const importPath = imports.get(baseType);

                if (!importPath) {
                  violations.push({
                    file,
                    rule: "repository-invalid-return-type",
                    reason: `Repository method "${interfaceName}.${methodName}" returns type "${baseType}" which is not imported. Domain return types must be Value Objects or Entities imported from domain/value-objects or domain/entities.`,
                    location: location(sourceFile, member),
                  });
                  return;
                }

                const isValidImport =
                  importPath.includes("/entities/") ||
                  importPath.includes("/entities") ||
                  importPath.includes("/value-objects/") ||
                  importPath.includes("/value-objects") ||
                  importPath === "@/backend/modules/shared" ||
                  importPath.startsWith("@/backend/modules/shared/") ||
                  importPath.includes("cv-profile");

                if (!isValidImport) {
                  violations.push({
                    file,
                    rule: "repository-invalid-return-type",
                    reason: `Repository method "${interfaceName}.${methodName}" returns type "${baseType}" imported from "${importPath}". Domain return types must be Value Objects or Entities imported from domain/value-objects or domain/entities.`,
                    location: location(sourceFile, member),
                  });
                }
              }
            }
          });
        }
      }
    });
  }

  return violations;
}

export function formatRepositoryReturnTypesViolations(violations) {
  if (violations.length === 0) return "";

  return [
    "Repository return types violations:",
    ...violations.map((violation) => {
      const location = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${location} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const violations = await findRepositoryReturnTypesViolations();

  if (violations.length > 0) {
    console.error(formatRepositoryReturnTypesViolations(violations));
    process.exitCode = 1;
    return;
  }

  console.log("DDD repository return types check passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
