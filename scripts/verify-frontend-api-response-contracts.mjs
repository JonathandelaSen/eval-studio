import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";

const root = process.cwd();
const apiFilePatterns = ["src/frontend/features/**/api/*-api.ts", "src/frontend/**/api/*-api.ts"];
const responseImportPattern = /^(?:@\/|src\/)app\/api\/.+\/responses$/;

function listFiles(patterns) {
  const result = spawnSync("rg", ["--files", ...patterns.flatMap((pattern) => ["-g", pattern])], {
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

function parseSource(fileName) {
  const source = readFileSync(join(root, fileName), "utf8");
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
}

function lineNumberAt(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function isTypeOnlyImport(importDeclaration, importSpecifier) {
  if (importDeclaration.importClause?.isTypeOnly) return true;
  return importSpecifier.isTypeOnly;
}

function collectTypeImports(sourceFile) {
  const imports = new Map();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

    const moduleSpecifier = statement.moduleSpecifier.text;
    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

    for (const element of namedBindings.elements) {
      const localName = element.name.text;
      const importedName = element.propertyName?.text ?? element.name.text;
      imports.set(localName, {
        importedName,
        moduleSpecifier,
        isTypeOnly: isTypeOnlyImport(statement, element),
      });
    }
  }

  return imports;
}

function typeArgumentName(typeNode) {
  if (!typeNode) return null;
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.text;
  }
  return null;
}

function visit(sourceFile, callback) {
  function walk(node) {
    callback(node);
    ts.forEachChild(node, walk);
  }
  walk(sourceFile);
}

function isExportedAsyncFunction(node) {
  if (!ts.isFunctionDeclaration(node)) return false;
  const modifiers = node.modifiers ?? [];
  return (
    modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
    modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)
  );
}

function callsFunction(node, functionName) {
  let found = false;
  visitNode(node, (child) => {
    if (!ts.isCallExpression(child)) return;
    if (!ts.isIdentifier(child.expression)) return;
    if (child.expression.text === functionName) found = true;
  });
  return found;
}

function hasReturnReadJsonResponse(node) {
  let found = false;
  visitNode(node, (child) => {
    if (!ts.isReturnStatement(child)) return;
    const expression = child.expression;
    if (!expression || !ts.isCallExpression(expression)) return;
    if (!ts.isIdentifier(expression.expression)) return;
    if (expression.expression.text === "readJsonResponse") found = true;
  });
  return found;
}

function visitNode(node, callback) {
  function walk(child) {
    callback(child);
    ts.forEachChild(child, walk);
  }
  walk(node);
}

const files = listFiles(apiFilePatterns);
const violations = [];

for (const file of files) {
  const sourceFile = parseSource(file);
  const typeImports = collectTypeImports(sourceFile);

  visit(sourceFile, (node) => {
    if (isExportedAsyncFunction(node) && callsFunction(node, "fetch") && !hasReturnReadJsonResponse(node)) {
      violations.push(
        `${file}:${lineNumberAt(sourceFile, node)}: exported API function that calls fetch must return readJsonResponse<ResponseType>(...).`,
      );
    }

    if (!ts.isCallExpression(node)) return;
    if (!ts.isIdentifier(node.expression)) return;
    if (node.expression.text !== "readJsonResponse") return;

    const typeNode = node.typeArguments?.[0];
    const responseTypeName = typeArgumentName(typeNode);
    const line = lineNumberAt(sourceFile, node);

    if (!responseTypeName) {
      violations.push(
        `${file}:${line}: readJsonResponse must use a named response contract imported from an API responses.ts file.`,
      );
      return;
    }

    if (!responseTypeName.endsWith("Response")) {
      violations.push(
        `${file}:${line}: ${responseTypeName} must be a response contract type ending in Response.`,
      );
    }

    const importInfo = typeImports.get(responseTypeName);
    if (!importInfo) {
      violations.push(
        `${file}:${line}: ${responseTypeName} must be imported from an API responses.ts file.`,
      );
      return;
    }

    if (!importInfo.isTypeOnly) {
      violations.push(
        `${file}:${line}: ${responseTypeName} must be imported with import type from ${importInfo.moduleSpecifier}.`,
      );
    }

    if (!responseImportPattern.test(importInfo.moduleSpecifier)) {
      violations.push(
        `${file}:${line}: ${responseTypeName} must be imported from @/app/api/**/responses, not ${importInfo.moduleSpecifier}.`,
      );
    }

    if (!importInfo.importedName.endsWith("Response")) {
      violations.push(
        `${file}:${line}: ${responseTypeName} must refer to an imported response contract type ending in Response.`,
      );
    }
  });
}

if (violations.length > 0) {
  console.error("Frontend API response contract violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Frontend API response contracts OK (${files.length} API files).`);
