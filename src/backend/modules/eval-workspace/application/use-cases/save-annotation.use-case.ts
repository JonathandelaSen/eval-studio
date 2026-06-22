import { annotationSchema } from "../../domain/artifacts";
import { EvalAnnotation } from "../../domain/entities/eval-annotation.entity";
import type { EvalWorkspaceRepository } from "../../domain/repositories/eval-workspace.repository";

export class SaveAnnotationUseCase {
  constructor(private readonly repo: EvalWorkspaceRepository) {}

  async execute(input: unknown): Promise<EvalAnnotation> {
    const annotation = EvalAnnotation.fromPrimitives(annotationSchema.parse(input));
    return this.repo.saveAnnotation(annotation);
  }
}
