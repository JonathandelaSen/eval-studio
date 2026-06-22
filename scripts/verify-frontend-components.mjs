import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const isReportMode = process.argv.includes("--report");
const shouldPrintAllowlist = process.argv.includes("--print-allowlist");
const shouldCheckAll = process.argv.includes("--all");

const CHECK_ROOTS = ["src/frontend/features", "src/frontend/components/shared"];
const EXCLUDED_ROOTS = ["src/frontend/components/ui"];

const RULES = {
  maxLines: {
    id: "max-lines",
    severity: "error",
    message: "component file has more than 350 lines",
  },
  reportLines: {
    id: "large-component",
    severity: "report",
    message: "component file has more than 250 lines",
  },
  tanstackInComponent: {
    id: "tanstack-in-component",
    severity: "error",
    message: "components must not import TanStack Query directly; move server-state logic to feature hooks",
  },
  directHttpInComponent: {
    id: "direct-http-in-component",
    severity: "error",
    message: "components must not call fetch() directly; move HTTP orchestration to feature hooks/api clients",
  },
  apiImportInComponent: {
    id: "api-import-in-component",
    severity: "error",
    message: "components must not import feature API modules directly; use feature hooks or props",
  },
  tooManyUseState: {
    id: "too-many-usestate",
    severity: "error",
    message: "component file has more than 5 useState() calls",
  },
  tooManyUseEffect: {
    id: "too-many-useeffect",
    severity: "error",
    message: "component file has more than 3 useEffect() calls",
  },
  tooManyHandlers: {
    id: "too-many-handlers",
    severity: "error",
    message: "component file has more than 6 local workflow handlers",
  },
  tooManyComponents: {
    id: "too-many-components",
    severity: "error",
    message: "component file declares more than 2 React components; extract sibling components",
  },
  jsxRegionComment: {
    id: "jsx-region-comment",
    severity: "error",
    message: "JSX region comments should become named components",
  },
  hardcodedVisibleText: {
    id: "hardcoded-visible-text",
    severity: "error",
    message: "visible UI text must use next-intl translations or be passed as props",
  },
  crossFeatureDeepImport: {
    id: "cross-feature-deep-import",
    severity: "error",
    message: "cross-feature imports must use the feature barrel",
  },
  sharedImportsFeature: {
    id: "shared-imports-feature",
    severity: "error",
    message: "shared components must not import feature code",
  },
};

const ALLOWLIST = {
  "src/frontend/features/cv-library/components/cv-library-view.tsx": {
    "api-import-in-component": 1,
  },
  "src/frontend/features/job-match-analysis/components/kanban/job-match-kanban-board.tsx": {
    "jsx-region-comment": 1,
  },
  // "src/frontend/features/activity-context/components/activity-context-view.tsx": {
  //   "tanstack-in-component": 1,
  //   "api-import-in-component": 1,
  // },
  // "src/frontend/features/cv-analysis/components/analysis-view.tsx": {
  //   "max-lines": 1,
  //   "large-component": 1,
  //   "direct-http-in-component": 4,
  //   "too-many-usestate": 1,
  //   "jsx-region-comment": 2,
  // },
  // "src/frontend/features/cv-analysis/components/cv-analysis-view.tsx": {
  //   "api-import-in-component": 1,
  //   "large-component": 1,
  // },
  // "src/frontend/features/cv-analysis/components/cv-score-copy-paste-modal.tsx": {
  //   "api-import-in-component": 1,
  // },
  // "src/frontend/features/cv-analysis/components/extraction-view.tsx": {
  //   "max-lines": 1,
  //   "large-component": 1,
  //   "direct-http-in-component": 2,
  //   "too-many-usestate": 1,
  //   "jsx-region-comment": 4,
  // },
  // "src/frontend/features/cv-analysis/components/general-analysis-form.tsx": {
  //   "jsx-region-comment": 3,
  // },
  // "src/frontend/features/cv-analysis/components/job-match-form.tsx": {
  //   "jsx-region-comment": 4,
  // },
  // "src/frontend/features/cv-analysis/components/new-analysis-flow.tsx": {
  //   "large-component": 1,
  // },
  // "src/frontend/features/cv-analysis/components/score-hero.tsx": {
  //   "large-component": 1,
  //   "jsx-region-comment": 5,
  // },
  // "src/frontend/features/cv-analysis/components/tab-chat-oferta.tsx": {
  //   "api-import-in-component": 1,
  //   "large-component": 1,
  //   "direct-http-in-component": 8,
  // },
  // "src/frontend/features/cv-analysis/components/tab-resumen.tsx": {
  //   "jsx-region-comment": 2,
  // },
  // "src/frontend/features/cv-editor/components/cv-editor-copy-paste-modal.tsx": {
  //   "api-import-in-component": 1,
  // },
  // "src/frontend/features/cv-editor/components/cv-editor-view.tsx": {
  //   "large-component": 1,
  //   "too-many-usestate": 1,
  // },
  // "src/frontend/features/cv-editor/components/cv-manual-editor/manual-editor.tsx": {
  //   "jsx-region-comment": 1,
  // },
  // "src/frontend/features/cv-library/components/cv-library-detail-summary.tsx": {
  //   "jsx-region-comment": 1,
  // },
  // "src/frontend/features/cv-library/components/upload-phase.tsx": {
  //   "direct-http-in-component": 1,
  //   "jsx-region-comment": 4,
  // },
  // "src/frontend/features/cv-templates/components/cv-profile-structure-copy-paste-modal.tsx": {
  //   "api-import-in-component": 1,
  // },
  // "src/frontend/features/job-match-analysis/components/job-match-analysis-detail.tsx": {
  //   "api-import-in-component": 1,
  //   "large-component": 1,
  // },
  // "src/frontend/features/job-match-analysis/components/job-match-analysis-view.tsx": {
  //   "tanstack-in-component": 1,
  //   "api-import-in-component": 1,
  //   "large-component": 1,
  // },
  // "src/frontend/features/job-match-analysis/components/job-match-extraction-view.tsx": {
  //   "api-import-in-component": 1,
  //   "large-component": 1,
  //   "too-many-usestate": 1,
  // },
  // "src/frontend/features/job-match-analysis/components/job-match-score-copy-paste-modal.tsx": {
  //   "api-import-in-component": 1,
  // },
  // "src/frontend/features/job-match-analysis/components/score-hero.tsx": {
  //   "jsx-region-comment": 3,
  // },
  // "src/frontend/features/job-match-analysis/components/tab-chat-oferta.tsx": {
  //   "api-import-in-component": 1,
  //   "max-lines": 1,
  //   "large-component": 1,
  //   "direct-http-in-component": 10,
  //   "too-many-usestate": 1,
  // },
  // "src/frontend/features/job-match-analysis/components/tab-resumen.tsx": {
  //   "jsx-region-comment": 2,
  // },
  // "src/frontend/features/objectives/components/objective-items-section.tsx": {
  //   "large-component": 1,
  //   "jsx-region-comment": 1,
  // },
  // "src/frontend/features/objectives/components/objective-outcomes-section.tsx": {
  //   "large-component": 1,
  //   "jsx-region-comment": 1,
  // },
  // "src/frontend/features/objectives/components/objective-summary-panel.tsx": {
  //   "jsx-region-comment": 2,
  // },
  // "src/frontend/features/objectives/components/objectives-view.tsx": {
  //   "max-lines": 1,
  //   "large-component": 1,
  // },
  // "src/frontend/features/work-journal/components/work-journal-view.tsx": {
  //   "tanstack-in-component": 1,
  //   "api-import-in-component": 3,
  //   "max-lines": 1,
  //   "large-component": 1,
  //   "too-many-usestate": 1,
  // },
};

function listChangedFiles() {
  const tracked = spawnSync(
    "git",
    ["diff", "--name-only", "--diff-filter=ACMR", "HEAD", "--", ...CHECK_ROOTS],
    { cwd: root, encoding: "utf8" }
  );
  const untracked = spawnSync(
    "git",
    ["ls-files", "--others", "--exclude-standard", "--", ...CHECK_ROOTS],
    { cwd: root, encoding: "utf8" }
  );

  const output = `${tracked.stdout}\n${untracked.stdout}`;
  return new Set(
    output
      .split("\n")
      .map((line) => line.trim())
      .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
      .filter(Boolean)
  );
}

function listFiles() {
  const result = spawnSync(
    "rg",
    ["--files", ...CHECK_ROOTS.flatMap((dir) => ["-g", `${dir}/**/*.tsx`])],
    { cwd: root, encoding: "utf8" }
  );
  if (result.status !== 0 && !result.stdout.trim()) return [];
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => !EXCLUDED_ROOTS.some((excluded) => file.startsWith(`${excluded}/`)))
    .filter((file) => !file.endsWith(".test.tsx"));
}

function featureName(filePath) {
  const parts = filePath.split("/");
  return parts[0] === "src" && parts[1] === "features" ? parts[2] : null;
}

function lineNumberForIndex(source, index) {
  return source.slice(0, index).split("\n").length;
}

function extractImports(source) {
  const imports = [];
  const patterns = [
    /import\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["']/g,
    /export\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.push({
        isTypeOnly: Boolean(match[1]),
        importedMembers: match[2] ? match[2].trim() : "",
        specifier: match[3],
        line: lineNumberForIndex(source, match.index ?? 0),
      });
    }
  }
  return imports;
}

function isAllowedImportContent(importedMembers) {
  if (!importedMembers) return false;
  let clean = importedMembers.trim();
  if (clean.startsWith("{") && clean.endsWith("}")) {
    clean = clean.slice(1, -1).trim();
  }
  const parts = clean.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return false;

  for (const part of parts) {
    let name = part;
    if (part.includes(" as ")) {
      name = part.split(" as ")[0].trim();
    }
    // Si se importa en línea con 'type', se trata de un tipo (ej. type FeedbackEntry)
    if (name.startsWith("type ")) {
      continue;
    }
    const lowerName = name.toLowerCase();
    // Excluir generadores de prompt, que no realizan llamadas API reales
    const isPrompt = lowerName.includes("prompt");
    if (!isPrompt) {
      return false;
    }
  }
  return true;
}

function addViolation(violations, file, rule, line, detail = "") {
  violations.push({
    file,
    ruleId: rule.id,
    severity: rule.severity,
    line,
    message: `${rule.message}${detail ? ` (${detail})` : ""}`,
  });
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function findLocalHandlers(source) {
  const handlers = [];
  const pattern =
    /\b(?:function\s+(handle[A-Z]\w*|submit[A-Z]\w*|save[A-Z]\w*|delete[A-Z]\w*|create[A-Z]\w*|update[A-Z]\w*|load[A-Z]\w*|rename[A-Z]\w*)|const\s+(handle[A-Z]\w*|submit[A-Z]\w*|save[A-Z]\w*|delete[A-Z]\w*|create[A-Z]\w*|update[A-Z]\w*|load[A-Z]\w*|rename[A-Z]\w*)\s*=)/g;
  for (const match of source.matchAll(pattern)) {
    handlers.push({
      name: match[1] ?? match[2],
      line: lineNumberForIndex(source, match.index ?? 0),
    });
  }
  return handlers;
}

function findComponentDeclarations(source) {
  const declarations = [];
  const patterns = [
    /(?:export\s+default\s+)?function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g,
    /(?:export\s+)?const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const start = match.index ?? 0;
      const nearby = source.slice(start, Math.min(source.length, start + 2000));
      if (!nearby.includes("<")) continue;
      declarations.push({
        name: match[1],
        line: lineNumberForIndex(source, start),
      });
    }
  }
  return declarations;
}

function findJsxRegionComments(source) {
  const comments = [];
  const pattern =
    /\{\/\*\s*([^*{}]*(?:Header|Sidebar|Tabs?|Panel|Footer|Actions?|Body|Content|List|Form|Section|Error)[^*{}]*)\s*\*\/\}/gi;
  for (const match of source.matchAll(pattern)) {
    comments.push({
      text: match[1].trim(),
      line: lineNumberForIndex(source, match.index ?? 0),
    });
  }
  return comments;
}

function findHardcodedVisibleText(source) {
  const findings = [];
  const textPattern = />\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ][^<>{}\n]{2,})\s*</g;
  const attrPattern =
    /\b(?:placeholder|title|aria-label|alt)=["']([A-Za-zÁÉÍÓÚÜÑáéíóúüñ][^"']{2,})["']/g;

  for (const match of source.matchAll(textPattern)) {
    const text = match[1].trim();
    if (isAllowedLiteral(text)) continue;
    findings.push({
      text,
      line: lineNumberForIndex(source, match.index ?? 0),
    });
  }

  for (const match of source.matchAll(attrPattern)) {
    const text = match[1].trim();
    if (isAllowedLiteral(text)) continue;
    findings.push({
      text,
      line: lineNumberForIndex(source, match.index ?? 0),
    });
  }

  return findings;
}

function isAllowedLiteral(text) {
  if (!text) return true;
  if (/^[A-Z0-9_./:-]+$/.test(text)) return true;
  if (/^\d+(\.\d+)?%?$/.test(text)) return true;
  if (text.includes("{") || text.includes("}")) return true;
  if (/^(Promise|Array|Map|Set|Record|Partial|Required|Readonly)\b/.test(text)) return true;
  return false;
}

function isApiImport(specifier) {
  return (
    specifier.includes("/api/") ||
    specifier.startsWith("../api/") ||
    specifier.startsWith("./api/") ||
    /^@\/features\/[^/]+\/api(?:\/|$)/.test(specifier)
  );
}

function analyzeFile(file) {
  const source = readFileSync(join(root, file), "utf8");
  const lines = source.split("\n").length;
  const violations = [];
  const currentFeature = featureName(file);
  const imports = extractImports(source);

  if (lines > 350) {
    addViolation(violations, file, RULES.maxLines, 1, `${lines} lines`);
  } else if (lines > 250) {
    addViolation(violations, file, RULES.reportLines, 1, `${lines} lines`);
  }

  for (const item of imports) {
    const { specifier, line, isTypeOnly, importedMembers } = item;

    if (specifier === "@tanstack/react-query") {
      addViolation(violations, file, RULES.tanstackInComponent, line, specifier);
    }

    if (isApiImport(specifier)) {
      const isExcluded =
        isTypeOnly ||
        specifier.includes("types") ||
        specifier.includes("responses") ||
        specifier.includes("prompt") ||
        isAllowedImportContent(importedMembers);
      if (!isExcluded) {
        addViolation(violations, file, RULES.apiImportInComponent, line, specifier);
      }
    }

    const featureMatch = specifier.match(/^@\/features\/([^/]+)(?:\/(.+))?$/);
    if (file.startsWith("src/frontend/components/shared/") && featureMatch) {
      addViolation(violations, file, RULES.sharedImportsFeature, line, specifier);
    }

    if (
      featureMatch &&
      currentFeature &&
      featureMatch[1] !== currentFeature &&
      featureMatch[2] &&
      featureMatch[2] !== "index"
    ) {
      addViolation(violations, file, RULES.crossFeatureDeepImport, line, specifier);
    }
  }

  for (const match of source.matchAll(/\bfetch\s*\(/g)) {
    addViolation(
      violations,
      file,
      RULES.directHttpInComponent,
      lineNumberForIndex(source, match.index ?? 0)
    );
  }

  const useStateCount = countMatches(source, /\buseState\s*\(/g);
  if (useStateCount > 5) {
    addViolation(violations, file, RULES.tooManyUseState, 1, `${useStateCount} calls`);
  }

  const useEffectCount = countMatches(source, /\buseEffect\s*\(/g);
  if (useEffectCount > 3) {
    addViolation(violations, file, RULES.tooManyUseEffect, 1, `${useEffectCount} calls`);
  }

  const handlers = findLocalHandlers(source);
  if (handlers.length > 6) {
    addViolation(violations, file, RULES.tooManyHandlers, handlers[6].line, `${handlers.length} handlers`);
  }

  const components = findComponentDeclarations(source);
  if (components.length > 2) {
    addViolation(
      violations,
      file,
      RULES.tooManyComponents,
      components[2].line,
      `${components.length} component declarations`
    );
  }

  for (const comment of findJsxRegionComments(source)) {
    addViolation(violations, file, RULES.jsxRegionComment, comment.line, comment.text);
  }

  for (const finding of findHardcodedVisibleText(source)) {
    addViolation(
      violations,
      file,
      RULES.hardcodedVisibleText,
      finding.line,
      finding.text.slice(0, 80)
    );
  }

  return violations;
}

function groupViolations(violations) {
  const grouped = new Map();
  for (const violation of violations) {
    const key = `${violation.file}\0${violation.ruleId}`;
    const existing = grouped.get(key) ?? [];
    existing.push(violation);
    grouped.set(key, existing);
  }
  return grouped;
}

function allowlistCount(file, ruleId) {
  return ALLOWLIST[file]?.[ruleId] ?? 0;
}

function splitAllowlisted(violations) {
  const active = [];
  const allowed = [];
  const grouped = groupViolations(violations);

  for (const [key, group] of grouped.entries()) {
    const [file, ruleId] = key.split("\0");
    const allowedCount = allowlistCount(file, ruleId);
    allowed.push(...group.slice(0, allowedCount));
    active.push(...group.slice(allowedCount));
  }

  return { active, allowed };
}

function printViolations(title, violations) {
  if (violations.length === 0) return;
  console.error(`${title}:`);
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line}: ${violation.ruleId}: ${violation.message}`
    );
  }
}

function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function uniqueCount(items, getKey) {
  return new Set(items.map(getKey)).size;
}

function formatSeverity(severity) {
  return severity === "error" ? "strict" : "report";
}

function printReportSection(title, lines) {
  console.log("");
  console.log(title);
  console.log("-".repeat(title.length));
  for (const line of lines) {
    console.log(line);
  }
}

function printRuleSummary(violations) {
  const byRule = countBy(violations, (violation) => violation.ruleId);
  const lines = byRule.map(([ruleId, count]) => {
    const rule = Object.values(RULES).find((candidate) => candidate.id === ruleId);
    const severity = rule ? formatSeverity(rule.severity) : "unknown";
    return `${String(count).padStart(4)}  ${ruleId.padEnd(28)} ${severity}`;
  });
  printReportSection("Findings by rule", lines.length > 0 ? lines : ["No findings."]);
}

function printTopFiles(violations) {
  const topFiles = countBy(violations, (violation) => violation.file).slice(0, 15);
  const lines = topFiles.map(([file, count]) => `${String(count).padStart(4)}  ${file}`);
  printReportSection("Top files by findings", lines.length > 0 ? lines : ["No findings."]);
}

function printDetailedReport(violations) {
  const byRule = new Map();
  for (const violation of violations) {
    const group = byRule.get(violation.ruleId) ?? [];
    group.push(violation);
    byRule.set(violation.ruleId, group);
  }

  console.log("");
  console.log("Details by rule");
  console.log("---------------");

  for (const [ruleId, group] of [...byRule.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const rule = Object.values(RULES).find((candidate) => candidate.id === ruleId);
    const severity = rule ? formatSeverity(rule.severity) : "unknown";
    const affectedFiles = uniqueCount(group, (violation) => violation.file);
    console.log("");
    console.log(`${ruleId} (${severity}) - ${group.length} finding(s), ${affectedFiles} file(s)`);

    const maxItems = 25;
    for (const violation of group.slice(0, maxItems)) {
      console.log(`  ${violation.file}:${violation.line}`);
      console.log(`    ${violation.message}`);
    }

    if (group.length > maxItems) {
      console.log(`  ... ${group.length - maxItems} more finding(s) omitted in this rule.`);
    }
  }
}

function printHumanReport({
  filesToCheck,
  changedFiles,
  reports,
  errors,
  allowedErrors,
  activeErrors,
}) {
  const allFindings = [...reports, ...errors];
  const strictFiles = uniqueCount(errors, (violation) => violation.file);
  const reportFiles = uniqueCount(reports, (violation) => violation.file);
  const changedCount = [...changedFiles].filter((file) => file.endsWith(".tsx")).length;

  console.log("Frontend Component Report");
  console.log("=========================");
  console.log(
    "Scope: full repository audit for src/frontend/features/**/components and src/frontend/components/shared/**."
  );
  console.log(
    `Check mode scans only changed TSX files (${changedCount} currently changed); use --all to force a full blocking scan.`
  );
  console.log("");
  console.log(`Files scanned:        ${filesToCheck.length}`);
  console.log(`Report-only findings: ${reports.length} across ${reportFiles} file(s)`);
  console.log(`Strict findings:      ${errors.length} across ${strictFiles} file(s)`);
  console.log(`Allowlisted strict:   ${allowedErrors.length}`);
  console.log(`New strict findings:  ${activeErrors.length}`);

  printRuleSummary(allFindings);
  printTopFiles(allFindings);
  printDetailedReport(allFindings);

  console.log("");
  console.log("How to read this");
  console.log("----------------");
  console.log("- report-only findings show cleanup candidates and do not fail check mode.");
  console.log("- strict findings fail only when they are in changed files during normal check mode.");
  console.log("- run `node scripts/verify-frontend-components.mjs --all` to test strict rules against the whole repo.");
}

function printAllowlist(violations) {
  const grouped = groupViolations(violations);
  const byFile = new Map();
  for (const [key, group] of grouped.entries()) {
    const [file, ruleId] = key.split("\0");
    const rules = byFile.get(file) ?? {};
    rules[ruleId] = group.length;
    byFile.set(file, rules);
  }

  console.log("const ALLOWLIST = {");
  for (const [file, rules] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`  ${JSON.stringify(file)}: {`);
    for (const [ruleId, count] of Object.entries(rules).sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`    ${JSON.stringify(ruleId)}: ${count},`);
    }
    console.log("  },");
  }
  console.log("};");
}

const files = listFiles();
const changedFiles = listChangedFiles();
const filesToCheck =
  isReportMode || shouldCheckAll
    ? files
    : files.filter((file) => changedFiles.has(file));
const violations = filesToCheck.flatMap(analyzeFile);
const errors = violations.filter((violation) => violation.severity === "error");
const reports = violations.filter((violation) => violation.severity === "report");
const { active: activeErrors, allowed: allowedErrors } = splitAllowlisted(errors);

if (shouldPrintAllowlist) {
  printAllowlist(errors);
}

if (isReportMode) {
  printHumanReport({
    filesToCheck,
    changedFiles,
    reports,
    errors,
    allowedErrors,
    activeErrors,
  });
  process.exit(0);
}

if (activeErrors.length > 0) {
  printViolations("Frontend component violations", activeErrors);
  console.error(
    `\n${activeErrors.length} new violation(s) found. Existing allowlisted debt: ${allowedErrors.length}. Run node scripts/verify-frontend-components.mjs --report for the full report.`
  );
  process.exit(1);
}

console.log(
  `Frontend components OK (${filesToCheck.length} changed TSX file(s) checked, ${allowedErrors.length} allowlisted strict finding(s), ${reports.length} report finding(s).`
);
if (filesToCheck.length === 0) {
  console.log(
    "Check mode only scans changed frontend component files. Run `node scripts/verify-frontend-components.mjs --report` for the full audit or `node scripts/verify-frontend-components.mjs --all` for a full blocking scan."
  );
}
