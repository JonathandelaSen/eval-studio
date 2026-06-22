import { EvalAnnotation } from "../entities/eval-annotation.entity";

export interface EvalAnnotationRepository {
  save(annotation: EvalAnnotation): Promise<EvalAnnotation>;
}
