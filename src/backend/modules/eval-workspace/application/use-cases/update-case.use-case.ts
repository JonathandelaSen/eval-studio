import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { CaseId } from "../../domain/value-objects/case-id.value-object";
import { EvalCase } from "../../domain/entities/eval-case.entity";
import type { EvalCaseRepository } from "../../domain/repositories/eval-case.repository";

export type UpdateCaseInput = {
  workspaceRoot?: string;
  caseId: string;
  name?: string;
  note?: string | null;
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
    const renderedPrompt = input.userMessage === undefined
      ? primitives.renderedPrompt
      : {
          format: "messages",
          messages: [
            ...(input.systemInstruction?.trim()
              ? [{ role: "system", content: input.systemInstruction.trim() }]
              : []),
            { role: "user", content: input.userMessage.trim() },
          ],
        };
    if (input.userMessage !== undefined && !input.userMessage.trim()) {
      throw new Error("User message cannot be empty.");
    }
    const updated = EvalCase.fromPrimitives({
      ...primitives,
      name: input.name ?? primitives.name,
      note:
        input.note === undefined ? primitives.note : input.note ?? undefined,
      renderedPrompt,
    });
    return this.deps.caseRepository.save(workspaceRoot, updated);
  }
}
