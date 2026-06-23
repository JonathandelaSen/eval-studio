import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { location, parseSource, toPosixRelative, walkFiles } from "./utils.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function isEntitySource(relativePath) {
  return (
    relativePath.startsWith("src/backend/modules/") &&
    relativePath.includes("/domain/entities/") &&
    relativePath.endsWith(".entity.ts") &&
    !relativePath.endsWith(".test.ts")
  );
}

function isEventSource(relativePath) {
  return (
    relativePath.startsWith("src/backend/modules/") &&
    relativePath.includes("/domain/events/") &&
    relativePath.endsWith(".event.ts") &&
    !relativePath.endsWith(".test.ts")
  );
}

function fileExists(rootDir, relativePath) {
  return readFile(path.join(rootDir, relativePath), "utf8").then(
    () => true,
    () => false,
  );
}

// Map every domain event class name to the string literal it assigns to its
// readonly `eventName` field, so a test asserting the string still counts.
async function buildEventNameRegistry(rootDir, files) {
  const registry = new Map();
  for (const file of files.filter(isEventSource)) {
    const content = await readFile(path.join(rootDir, file), "utf8");
    const sourceFile = parseSource(content, file);
    sourceFile.statements.forEach((node) => {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      node.members.forEach((member) => {
        if (
          ts.isPropertyDeclaration(member) &&
          member.name.getText(sourceFile) === "eventName" &&
          member.initializer &&
          ts.isStringLiteral(member.initializer)
        ) {
          registry.set(node.name.text, member.initializer.text);
        }
      });
    });
  }
  return registry;
}

// Collect the event classes an entity records via recordDomainEvent(new XEvent(...)).
function recordedEvents(sourceFile) {
  const events = [];
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.getText(sourceFile) === "recordDomainEvent"
    ) {
      const [arg] = node.arguments;
      if (arg && ts.isNewExpression(arg) && ts.isIdentifier(arg.expression)) {
        events.push({ className: arg.expression.text, node: arg });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return events;
}

export async function findUntestedEntityEvents({ rootDir = repoRoot } = {}) {
  const modulesDir = path.join(rootDir, "src/backend/modules");
  const files = (await walkFiles(modulesDir)).map((filePath) =>
    toPosixRelative(rootDir, filePath),
  );

  const eventNames = await buildEventNameRegistry(rootDir, files);
  const violations = [];

  for (const file of files.filter(isEntitySource)) {
    const content = await readFile(path.join(rootDir, file), "utf8");
    const sourceFile = parseSource(content, file);
    const events = recordedEvents(sourceFile);
    if (events.length === 0) continue;

    const testFile = file.replace(/\.ts$/, ".test.ts");
    if (!(await fileExists(rootDir, testFile))) {
      violations.push({
        file,
        rule: "entity-event-untested",
        reason: `Entity records domain events but has no sibling test "${testFile}".`,
        location: location(sourceFile, events[0].node),
      });
      continue;
    }

    const testContent = await readFile(path.join(rootDir, testFile), "utf8");
    for (const event of events) {
      const eventName = eventNames.get(event.className);
      const referencesClass = testContent.includes(event.className);
      const referencesName = eventName ? testContent.includes(eventName) : false;
      if (!referencesClass && !referencesName) {
        violations.push({
          file: testFile,
          rule: "entity-event-untested",
          reason: `Domain event "${event.className}"${
            eventName ? ` ("${eventName}")` : ""
          } recorded by "${path.basename(file)}" is not asserted in its test.`,
          location: location(sourceFile, event.node),
        });
      }
    }
  }

  return violations;
}

export function formatUntestedEntityEvents(violations) {
  if (violations.length === 0) return "";

  return [
    "DDD entity event coverage violations:",
    ...violations.map((violation) => {
      const loc = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${loc} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const violations = await findUntestedEntityEvents();

  if (violations.length > 0) {
    console.error(formatUntestedEntityEvents(violations));
    process.exitCode = 1;
    return;
  }

  console.log("DDD entity event coverage check passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
