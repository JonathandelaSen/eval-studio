import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

export async function findUseCaseReturnTypesViolations({
  rootDir = repoRoot,
} = {}) {
  const modulesDir = path.join(rootDir, "src/backend/modules");
  const allFiles = await walkFiles(modulesDir);
  const useCaseFiles = allFiles
    .map((filePath) => toPosixRelative(rootDir, filePath))
    .filter((file) => {
      const parts = file.split("/");
      const moduleName = parts[2];
      return (
        moduleName !== "shared" &&
        file.includes("/application/use-cases/") &&
        file.endsWith(".use-case.ts") &&
        !file.endsWith(".test.ts")
      );
    })
    .sort();

  const violations = [];

  for (const file of useCaseFiles) {
    const content = await readFile(path.join(rootDir, file), "utf8");
    const sourceFile = parseSource(content, file);

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
      if (ts.isClassDeclaration(node) && node.name && node.name.text.endsWith("UseCase")) {
        const className = node.name.text;
        const executeMethod = node.members.find(
          (member) => ts.isMethodDeclaration(member) && member.name.getText(sourceFile) === "execute"
        );

        if (!executeMethod) {
          violations.push({
            file,
            rule: "use-case-missing-execute",
            reason: `Use case class "${className}" must have an "execute" method.`,
            location: location(sourceFile, node.name),
          });
          return;
        }

        if (!executeMethod.type) {
          violations.push({
            file,
            rule: "use-case-missing-return-type",
            reason: `Use case execute method "${className}.execute" must have an explicit return type.`,
            location: location(sourceFile, executeMethod.name),
          });
          return;
        }

        const baseType = getBaseTypeName(executeMethod.type, sourceFile);

        if (!baseType) {
          violations.push({
            file,
            rule: "use-case-invalid-return-type",
            reason: `Use case execute method "${className}.execute" has an invalid or unresolved return type.`,
            location: location(sourceFile, executeMethod),
          });
          return;
        }

        if (baseType === "void") {
          return;
        }

        const isPrimitive = ["boolean", "string", "number", "null", "undefined"].includes(
          baseType
        );

        if (isPrimitive) {
          violations.push({
            file,
            rule: "use-case-invalid-return-type",
            reason: `Use case execute method "${className}.execute" returns primitive type "${baseType}". Use cases must return Entities or Value Objects.`,
            location: location(sourceFile, executeMethod),
          });
          return;
        }

        if (baseType === "inline-object") {
          violations.push({
            file,
            rule: "use-case-invalid-return-type",
            reason: `Use case execute method "${className}.execute" returns an inline object structure. Use cases must return Entities or Value Objects.`,
            location: location(sourceFile, executeMethod),
          });
          return;
        }

        const importPath = imports.get(baseType);

        if (!importPath) {
          const isLocallyDeclared = sourceFile.statements.some((stmt) => {
            return (
              (ts.isClassDeclaration(stmt) || ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)) &&
              stmt.name &&
              stmt.name.text === baseType
            );
          });

          if (isLocallyDeclared) {
            violations.push({
              file,
              rule: "use-case-invalid-return-type",
              reason: `Use case execute method "${className}.execute" returns type "${baseType}" declared locally in the same file. Use cases must return Entities or Value Objects.`,
              location: location(sourceFile, executeMethod),
            });
          } else {
            violations.push({
              file,
              rule: "use-case-invalid-return-type",
              reason: `Use case execute method "${className}.execute" returns type "${baseType}" which is not imported. Use cases must return Entities or Value Objects.`,
              location: location(sourceFile, executeMethod),
            });
          }
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
            rule: "use-case-invalid-return-type",
            reason: `Use case execute method "${className}.execute" returns type "${baseType}" imported from "${importPath}". Use cases must return Entities or Value Objects.`,
            location: location(sourceFile, executeMethod),
          });
        }
      }
    });
  }

  return violations;
}

export function formatUseCaseReturnTypesViolations(violations) {
  if (violations.length === 0) return "";

  return [
    "Use case return types violations:",
    ...violations.map((violation) => {
      const location = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${location} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const violations = await findUseCaseReturnTypesViolations();

  if (violations.length > 0) {
    console.error(formatUseCaseReturnTypesViolations(violations));
    process.exitCode = 1;
    return;
  }

  console.log("DDD use case return types check passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
