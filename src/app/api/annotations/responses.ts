import type { EvalAnnotationPrimitives } from "@/backend/modules/eval-workspace";

export type SaveAnnotationResponse = EvalAnnotationPrimitives;

export function toSaveAnnotationResponse(
  annotation: EvalAnnotationPrimitives,
): SaveAnnotationResponse {
  return { ...annotation, tags: annotation.tags ? [...annotation.tags] : undefined };
}
