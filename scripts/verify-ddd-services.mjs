import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modulesRoot = path.join(repoRoot, "src/backend/modules");

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
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function toPosixRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function isServiceCandidate(file) {
  if (
    !file.includes("/infrastructure/services/") &&
    !file.includes("/domain/services/")
  ) {
    return false;
  }
  if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return false;
  if (file.endsWith(".test.ts") || file.endsWith(".d.ts")) return false;
  if (file.endsWith(".test.tsx") || file.endsWith(".d.tsx")) return false;
  if (file.endsWith(".factory.ts") || file.endsWith(".factory.tsx")) return false;
  return true;
}

function location(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  );
  return `${line + 1}:${character + 1}`;
}

function hasModifier(node, kind) {
  return node.modifiers?.some((modifier) => modifier.kind === kind) ?? false;
}

function isPublicInstanceMethod(member) {
  if (!ts.isMethodDeclaration(member)) return false;
  if (hasModifier(member, ts.SyntaxKind.PrivateKeyword)) return false;
  if (hasModifier(member, ts.SyntaxKind.ProtectedKeyword)) return false;
  if (hasModifier(member, ts.SyntaxKind.StaticKeyword)) return false;
  return true;
}

function getBaseTypeName(typeNode, sourceFile) {
  if (!typeNode) return null;

  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText(sourceFile);
    if (name === "Promise" || name === "ReadonlyArray" || name === "Array") {
      return typeNode.typeArguments?.[0]
        ? getBaseTypeName(typeNode.typeArguments[0], sourceFile)
        : null;
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
      const baseTypeName = getBaseTypeName(childType, sourceFile);
      if (baseTypeName) return baseTypeName;
    }
  }

  return null;
}

function collectImports(sourceFile) {
  const imports = new Map();

  sourceFile.statements.forEach((node) => {
    if (!ts.isImportDeclaration(node) || !node.importClause) return;

    const moduleSpecifier = node.moduleSpecifier
      .getText(sourceFile)
      .replace(/['"]/g, "");

    if (node.importClause.name) {
      imports.set(node.importClause.name.text, moduleSpecifier);
    }

    const namedBindings = node.importClause.namedBindings;
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      namedBindings.elements.forEach((element) => {
        imports.set(element.name.text, moduleSpecifier);
      });
    }
  });

  return imports;
}

function isEntityOrValueObjectImport(importPath) {
  return (
    importPath.includes("/entities/") ||
    importPath.includes("/entities") ||
    importPath.includes("/value-objects/") ||
    importPath.includes("/value-objects")
  );
}

function findServiceClass(sourceFile) {
  const classes = sourceFile.statements.filter(ts.isClassDeclaration);
  const implementedClasses = classes.filter(
    (node) => node.heritageClauses?.some((clause) => clause.token === ts.SyntaxKind.ImplementsKeyword) ?? false,
  );
  const exportedImplementedClasses = implementedClasses.filter((node) =>
    hasModifier(node, ts.SyntaxKind.ExportKeyword),
  );

  return exportedImplementedClasses[0] ?? implementedClasses[0] ?? classes[0] ?? null;
}

function findInlineServiceInstantiations(sourceFile, node) {
  const instantiations = [];

  function visit(child) {
    if (
      ts.isNewExpression(child) &&
      ts.isIdentifier(child.expression) &&
      child.expression.text.endsWith("Service")
    ) {
      instantiations.push(child);
    }

    ts.forEachChild(child, visit);
  }

  ts.forEachChild(node, visit);
  return instantiations;
}

const files = (await walkFiles(modulesRoot))
  .map(toPosixRelative)
  .filter(isServiceCandidate)
  .sort();

const failures = [];

for (const file of files) {
  const absolutePath = path.join(repoRoot, file);
  const source = await readFile(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const basename = path.posix.basename(file);
  const imports = collectImports(sourceFile);

  if (!basename.endsWith(".service.ts") && !basename.endsWith(".service.tsx")) {
    failures.push(
      `${file}: service files must use the descriptive "*.service.ts" suffix.`,
    );
  }

  if (file.includes("/domain/services/")) {
    const interfaces = sourceFile.statements.filter(ts.isInterfaceDeclaration);
    if (interfaces.length === 0) {
      failures.push(`${file}: domain service files must define a service interface.`);
      continue;
    }

    for (const serviceInterface of interfaces) {
      for (const member of serviceInterface.members) {
        if (!ts.isMethodSignature(member)) continue;
        if (!member.type) {
          failures.push(
            `${file}:${location(sourceFile, member.name)}: domain service method must have an explicit return type.`,
          );
          continue;
        }

        const baseTypeName = getBaseTypeName(member.type, sourceFile);
        const importPath = baseTypeName ? imports.get(baseTypeName) : null;

        if (!baseTypeName || !importPath || !isEntityOrValueObjectImport(importPath)) {
          failures.push(
            `${file}:${location(sourceFile, member.name)}: domain service method must return an Entity or Value Object; found "${baseTypeName ?? member.type.getText(sourceFile)}".`,
          );
        }
      }
    }
    continue;
  }

  const serviceClass = findServiceClass(sourceFile);
  if (!serviceClass || !serviceClass.name) {
    failures.push(`${file}: service files must define a service class.`);
    continue;
  }

  const hasImplements =
    serviceClass.heritageClauses?.some((clause) => clause.token === ts.SyntaxKind.ImplementsKeyword) ??
    false;
  if (!hasImplements) {
    failures.push(
      `${file}:${location(sourceFile, serviceClass.name)}: service class "${serviceClass.name.text}" must implement its domain service interface.`,
    );
  }

  const inlineServiceInstantiations = findInlineServiceInstantiations(
    sourceFile,
    serviceClass,
  );
  for (const instantiation of inlineServiceInstantiations) {
    failures.push(
      `${file}:${location(sourceFile, instantiation)}: service dependencies must be injected through the constructor, not instantiated inline.`,
    );
  }

  const publicMethods = serviceClass.members.filter(isPublicInstanceMethod);
  if (publicMethods.length !== 1) {
    failures.push(
      `${file}:${location(sourceFile, serviceClass.name)}: service class "${serviceClass.name.text}" must expose exactly one public action method; found ${publicMethods.length}.`,
    );
    continue;
  }

  const publicMethod = publicMethods[0];
  if (!publicMethod.type) {
    failures.push(
      `${file}:${location(sourceFile, publicMethod.name)}: public service method must have an explicit return type.`,
    );
    continue;
  }

  const baseTypeName = getBaseTypeName(publicMethod.type, sourceFile);
  const importPath = baseTypeName ? imports.get(baseTypeName) : null;

  if (!baseTypeName || !importPath || !isEntityOrValueObjectImport(importPath)) {
    failures.push(
      `${file}:${location(sourceFile, publicMethod.name)}: public service method must return an Entity or Value Object; found "${baseTypeName ?? publicMethod.type.getText(sourceFile)}".`,
    );
  }
}

if (failures.length > 0) {
  console.error("DDD service verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("DDD service verification passed.");
