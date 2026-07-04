import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FilesystemEvalCaseRepository } from "../../infrastructure/filesystem-eval-case.repository";
import { FilesystemEvalSuiteRepository } from "../../infrastructure/filesystem-eval-suite.repository";
import { DuplicateCaseUseCase } from "./duplicate-case.use-case";

const suiteId = "550e8400-e29b-41d4-a716-446655440000";
const sourceCaseId = "550e8400-e29b-41d4-a716-446655440001";
const duplicateCaseId = "550e8400-e29b-41d4-a716-446655440002";
const legacyActionId = "550e8400-e29b-41d4-a716-446655440003";

describe("DuplicateCaseUseCase", () => {
  let workspaceRoot: string;
  let suiteDirectory: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "eval-studio-duplicate-case-"),
    );
    suiteDirectory = path.join(workspaceRoot, "suites", "support");
    await fs.mkdir(path.join(suiteDirectory, "cases"), { recursive: true });
    await fs.writeFile(
      path.join(suiteDirectory, "suite.json"),
      JSON.stringify({
        schemaVersion: "1",
        suiteId,
        name: "Support",
        caseIds: [sourceCaseId],
      }),
      "utf8",
    );
    await fs.writeFile(
      path.join(suiteDirectory, "cases", "refund.case.json"),
      JSON.stringify({
        schemaVersion: "1",
        caseId: sourceCaseId,
        suiteId,
        name: "Refund policy",
        note: "Stay grounded",
        createdAt: "2026-07-01T10:00:00.000Z",
        createdBy: { source: "fixture" },
        input: { question: "Can this item be returned?" },
        promptTemplate: { format: "text", text: "Answer {{question}}" },
        promptVariables: { question: "Can this item be returned?" },
        renderedPrompt: {
          format: "messages",
          messages: [{ role: "user", content: "Can this item be returned?" }],
        },
        runtime: { provider: "openai", model: "gpt-5" },
        expectedOutput: { answer: "No" },
        source: { file: "refunds.md" },
      }),
      "utf8",
    );
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("copies the case content with a new identity and adds it to the suite", async () => {
    const duplicate = await new DuplicateCaseUseCase({
      caseRepository: new FilesystemEvalCaseRepository(),
      suiteRepository: new FilesystemEvalSuiteRepository(),
      idFactory: () => duplicateCaseId,
      now: () => "2026-07-04T12:00:00.000Z",
    }).execute({ workspaceRoot, caseId: sourceCaseId });

    expect(duplicate.toPrimitives()).toEqual({
      schemaVersion: "1",
      caseId: duplicateCaseId,
      suiteId,
      name: "Refund policy copy",
      note: "Stay grounded",
      createdAt: "2026-07-04T12:00:00.000Z",
      createdBy: { source: "eval-studio", duplicatedFrom: sourceCaseId },
      input: { question: "Can this item be returned?" },
      promptTemplate: { format: "text", text: "Answer {{question}}" },
      promptVariables: { question: "Can this item be returned?" },
      renderedPrompt: {
        format: "messages",
        messages: [{ role: "user", content: "Can this item be returned?" }],
      },
      runtime: { provider: "openai", model: "gpt-5" },
      expectedOutput: { answer: "No" },
      source: { file: "refunds.md" },
    });

    const persisted = JSON.parse(
      await fs.readFile(
        path.join(suiteDirectory, "cases", `${duplicateCaseId}.case.json`),
        "utf8",
      ),
    );
    expect(persisted).toEqual(duplicate.toPrimitives());

    const suite = JSON.parse(
      await fs.readFile(path.join(suiteDirectory, "suite.json"), "utf8"),
    ) as { caseIds: string[] };
    expect(suite.caseIds).toEqual([sourceCaseId, duplicateCaseId]);
  });

  it("uses the owning suite when a legacy actionId disagrees with it", async () => {
    const sourceFile = path.join(
      suiteDirectory,
      "cases",
      "refund.case.json",
    );
    const source = JSON.parse(await fs.readFile(sourceFile, "utf8")) as Record<
      string,
      unknown
    >;
    delete source.suiteId;
    source.actionId = legacyActionId;
    await fs.writeFile(sourceFile, JSON.stringify(source), "utf8");

    await new DuplicateCaseUseCase({
      caseRepository: new FilesystemEvalCaseRepository(),
      suiteRepository: new FilesystemEvalSuiteRepository(),
      idFactory: () => duplicateCaseId,
      now: () => "2026-07-04T12:00:00.000Z",
    }).execute({ workspaceRoot, caseId: sourceCaseId });

    const persisted = JSON.parse(
      await fs.readFile(
        path.join(suiteDirectory, "cases", `${duplicateCaseId}.case.json`),
        "utf8",
      ),
    ) as { suiteId: string };
    expect(persisted.suiteId).toBe(suiteId);

    const suite = JSON.parse(
      await fs.readFile(path.join(suiteDirectory, "suite.json"), "utf8"),
    ) as { caseIds: string[] };
    expect(suite.caseIds).toEqual([sourceCaseId, duplicateCaseId]);
  });
});
