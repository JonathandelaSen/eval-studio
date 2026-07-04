import { randomUUID } from "node:crypto";
import { EvalCase } from "../../domain/entities/eval-case.entity";
import type { EvalCaseRepository } from "../../domain/repositories/eval-case.repository";
import type { EvalSuiteRepository } from "../../domain/repositories/eval-suite.repository";
import { SuiteId } from "../../domain/value-objects/suite-id.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";

export class CreateCaseUseCase {
  constructor(
    private readonly deps: {
      caseRepository: EvalCaseRepository;
      suiteRepository: EvalSuiteRepository;
      idFactory?: () => string;
      now?: () => string;
    },
  ) {}

  async execute(input: {
    workspaceRoot?: string;
    suiteId: string;
    name: string;
    note?: string;
    expectedOutput?: string;
    systemInstruction?: string;
    userMessage: string;
  }): Promise<EvalCase> {
    const root = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const suiteId = SuiteId.fromPrimitives(input.suiteId);
    const suite = await this.deps.suiteRepository.find(root, suiteId);
    const caseId = (this.deps.idFactory ?? randomUUID)();
    const userMessage = input.userMessage.trim();
    const systemInstruction = input.systemInstruction?.trim();
    if (!userMessage) throw new Error("User message cannot be empty.");
    const renderedPrompt = systemInstruction
      ? {
          format: "messages",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage },
          ],
        }
      : { format: "text", text: userMessage };
    const evalCase = EvalCase.fromPrimitives({
      schemaVersion: "1",
      caseId,
      suiteId: input.suiteId,
      name: input.name,
      ...(input.note?.trim() ? { note: input.note.trim() } : {}),
      ...(input.expectedOutput?.trim()
        ? { expectedOutput: input.expectedOutput.trim() }
        : {}),
      createdAt: (this.deps.now ?? (() => new Date().toISOString()))(),
      createdBy: { source: "eval-studio" },
      renderedPrompt,
    });
    await this.deps.caseRepository.save(root, evalCase);
    suite.addCase(caseId);
    await this.deps.suiteRepository.save(root, suite);
    return evalCase;
  }
}
