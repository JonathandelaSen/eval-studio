import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import { EvalCase } from "../../domain/entities/eval-case.entity";
import type { EvalCaseRepository } from "../../domain/repositories/eval-case.repository";
import type { JsonRecord } from "../../domain/entities/eval-workspace.entity";

export type UpdateCaseInput = {
  workspaceRoot?: string;
  caseId: string;
  name?: string;
  note?: string | null;
  input?: JsonRecord | null;
  expectedOutput?: string | null;
  systemInstruction?: string;
  userMessage?: string;
};

export class UpdateCaseUseCase {
  constructor(private readonly deps: { caseRepository: EvalCaseRepository }) {}

  async execute(input: UpdateCaseInput): Promise<EvalCase> {
    const workspaceRoot = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    const caseId = CaseId.fromPrimitives(input.caseId);
    const existing = await this.deps.caseRepository.find(workspaceRoot, caseId);
    const primitives = existing.toPrimitives();
    const userMessage = input.userMessage?.trim();
    const systemInstruction = input.systemInstruction?.trim();
    const renderedPrompt = userMessage === undefined
      ? primitives.renderedPrompt
      : systemInstruction
        ? {
            format: "messages",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userMessage },
            ],
          }
        : { format: "text", text: userMessage };
    if (input.userMessage !== undefined && !input.userMessage.trim()) {
      throw new Error("User message cannot be empty.");
    }
    const updated = EvalCase.fromPrimitives({
      ...primitives,
      name: input.name ?? primitives.name,
      note:
        input.note === undefined ? primitives.note : input.note ?? undefined,
      input:
        input.input === undefined ? primitives.input : input.input ?? undefined,
      expectedOutput:
        input.expectedOutput === undefined
          ? primitives.expectedOutput
          : input.expectedOutput?.trim() || undefined,
      renderedPrompt,
    });
    return this.deps.caseRepository.save(workspaceRoot, updated);
  }
}
