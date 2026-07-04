import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { UpdateCaseUseCase } from "./update-case.use-case";
import { CaseNotFoundError } from "../../domain/errors/case-not-found.error";
import { FilesystemEvalCaseRepository } from "../../infrastructure/filesystem-eval-case.repository";
import type { EvalCasePrimitives } from "../../domain/entities/eval-workspace.entity";

const caseId = "550e8400-e29b-41d4-a716-446655440001";

const casePrimitives: EvalCasePrimitives = {
  caseId,
  suiteId: "550e8400-e29b-41d4-a716-446655440000",
  name: "Summarize invoice",
  note: "Focus on totals",
  input: { invoiceId: "inv-1" },
  expectedOutput: { currency: "EUR" },
  createdAt: "2026-07-01T00:00:00.000Z",
  renderedPrompt: { format: "text", text: "Summarize this invoice." },
};

describe("UpdateCaseUseCase", () => {
  let workspaceRoot: string;
  let caseFile: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
    const directory = path.join(workspaceRoot, "suites", "invoices");
    await fs.mkdir(directory, { recursive: true });
    caseFile = path.join(directory, "summarize.case.json");
    await fs.writeFile(caseFile, JSON.stringify(casePrimitives), "utf8");
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  function useCase() {
    return new UpdateCaseUseCase({
      caseRepository: new FilesystemEvalCaseRepository(),
    });
  }

  it("renames the case and persists it in place", async () => {
    const updated = await useCase().execute({
      workspaceRoot,
      caseId,
      name: "Summarize refund invoice",
    });

    expect(updated.toPrimitives().name).toBe("Summarize refund invoice");
    const persisted = JSON.parse(await fs.readFile(caseFile, "utf8"));
    expect(persisted.name).toBe("Summarize refund invoice");
    expect(persisted.note).toBe("Focus on totals");
  });

  it("updates the note and clears it with null", async () => {
    await useCase().execute({ workspaceRoot, caseId, note: "Check currency" });
    let persisted = JSON.parse(await fs.readFile(caseFile, "utf8"));
    expect(persisted.note).toBe("Check currency");
    expect(persisted.name).toBe("Summarize invoice");

    await useCase().execute({ workspaceRoot, caseId, note: null });
    persisted = JSON.parse(await fs.readFile(caseFile, "utf8"));
    expect(persisted.note).toBeUndefined();
  });

  it("updates the executable messages prompt", async () => {
    const updated = await useCase().execute({
      workspaceRoot,
      caseId,
      systemInstruction: "Use only facts.",
      userMessage: "Summarize this invoice.",
    });

    expect(updated.toPrimitives().renderedPrompt).toEqual({
      format: "messages",
      messages: [
        { role: "system", content: "Use only facts." },
        { role: "user", content: "Summarize this invoice." },
      ],
    });
  });

  it("updates input and expected output", async () => {
    const updated = await useCase().execute({
      workspaceRoot,
      caseId,
      input: { invoiceId: "inv-2", includeTax: true },
      expectedOutput: { currency: "USD", total: 125 },
    });

    expect(updated.toPrimitives()).toMatchObject({
      input: { invoiceId: "inv-2", includeTax: true },
      expectedOutput: { currency: "USD", total: 125 },
    });
  });

  it("clears input and expected output with null", async () => {
    const updated = await useCase().execute({
      workspaceRoot,
      caseId,
      input: null,
      expectedOutput: null,
    });

    expect(updated.toPrimitives().input).toBeUndefined();
    expect(updated.toPrimitives().expectedOutput).toBeUndefined();
  });

  it("rejects an empty name", async () => {
    await expect(
      useCase().execute({ workspaceRoot, caseId, name: " " }),
    ).rejects.toThrow("Case name cannot be empty.");
  });

  it("fails when the case does not exist", async () => {
    await expect(
      useCase().execute({
        workspaceRoot,
        caseId: "550e8400-e29b-41d4-a716-446655440099",
        name: "Renamed",
      }),
    ).rejects.toThrow(CaseNotFoundError);
  });
});
