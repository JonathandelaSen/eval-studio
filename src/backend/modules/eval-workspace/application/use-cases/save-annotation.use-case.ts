import {
  EvalAnnotation,
  type EvalAnnotationPrimitives,
} from "../../domain/entities/eval-annotation.entity";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";

export class SaveAnnotationUseCase {
  constructor(private readonly repo: EvalWorkspaceRepository) {}

  async execute(input: unknown): Promise<EvalAnnotation> {
    const annotation = EvalAnnotation.fromPrimitives(
      input as EvalAnnotationPrimitives,
    );
    return this.repo.saveAnnotation(annotation);
  }
}
