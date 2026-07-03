import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import {
  EvalAnnotation,
  type EvalAnnotationPrimitives,
} from "../../domain/entities/eval-annotation.entity";
import type { EvalAnnotationRepository } from "../../domain/repositories/eval-annotation.repository";

export type SaveAnnotationInput = {
  workspaceRoot?: string;
} & EvalAnnotationPrimitives;

export class SaveAnnotationUseCase {
  constructor(private readonly repo: EvalAnnotationRepository) {}

  async execute(input: SaveAnnotationInput): Promise<EvalAnnotation> {
    const { workspaceRoot, ...annotationPrimitives } = input;
    const annotation = EvalAnnotation.fromPrimitives(annotationPrimitives);
    const directory = workspaceRoot
      ? WorkspaceRoot.fromPrimitives(workspaceRoot)
      : undefined;
    return this.repo.save(directory, annotation);
  }
}
