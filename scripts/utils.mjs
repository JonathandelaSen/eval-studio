import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

export async function walkFiles(dir) {
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

export function toPosixRelative(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

export function parseSource(source, fileName) {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
}

export function location(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${line + 1}:${character + 1}`;
}

export function moduleOf(file) {
  const match = file.match(/src\/backend\/modules\/([^/]+)\//);
  return match ? match[1] : null;
}

function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export function getExpectedAggregateName(fileName) {
  const base = path.basename(fileName);
  const prefix = base.replace(/\.repository\.ts$/, "").replace(/\.ts$/, "");
  return toPascalCase(prefix);
}

export function hasHeritage(node, baseName) {
  return (
    node.heritageClauses?.some((clause) =>
      clause.types.some((type) => type.expression.getText() === baseName)
    ) ?? false
  );
}

export function getBaseTypeName(typeNode, sourceFile) {
  if (!typeNode) return null;

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

  return null;
}

export async function buildEntityRegistry(rootDir) {
  const modulesDir = path.join(rootDir, "src/backend/modules");
  const files = (await walkFiles(modulesDir))
    .map((filePath) => toPosixRelative(rootDir, filePath))
    .filter((file) => file.includes("/domain/entities/") && file.endsWith(".entity.ts"));

  const registry = new Map();
  for (const file of files) {
    const content = await readFile(path.join(rootDir, file), "utf8");
    const sourceFile = parseSource(content, file);
    const moduleName = moduleOf(file);
    sourceFile.statements.forEach((node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        registry.set(node.name.text, {
          module: moduleName,
          isAggregateRoot: hasHeritage(node, "AggregateRoot"),
        });
      }
    });
  }
  return registry;
}

export async function loadDomainRepositoryFiles(rootDir) {
  const modulesDir = path.join(rootDir, "src/backend/modules");
  const files = (await walkFiles(modulesDir))
    .map((filePath) => toPosixRelative(rootDir, filePath))
    .filter((file) => file.includes("/domain/repositories/") && file.endsWith(".repository.ts"))
    .sort();

  const loaded = [];
  for (const file of files) {
    const content = await readFile(path.join(rootDir, file), "utf8");
    loaded.push({ file, sourceFile: parseSource(content, file) });
  }
  return loaded;
}

export function eachRepositoryMethodType(sourceFile, visit) {
  sourceFile.statements.forEach((node) => {
    if (!ts.isInterfaceDeclaration(node)) return;
    node.members.forEach((member) => {
      if (!ts.isMethodSignature(member)) return;
      const methodName = member.name.getText(sourceFile);
      member.parameters.forEach((parameter) => {
        if (parameter.type) {
          visit({ methodName, typeNode: parameter.type, role: "parameter", node: parameter });
        }
      });
      if (member.type) {
        visit({ methodName, typeNode: member.type, role: "return", node: member });
      }
    });
  });
}
