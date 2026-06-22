import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import { CaseId } from "../value-objects/case-id.value-object";
import { HumanScore } from "../value-objects/human-score.value-object";
import { ResultId } from "../value-objects/result-id.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";

export interface EvalAnnotationPrimitives {
  resultId: string;
  caseId: string;
  runId: string;
  updatedAt: string;
  score: number;
  comment?: string;
  tags?: string[];
}

export class EvalAnnotation extends AggregateRoot {
  private constructor(
    private readonly resultIdValue: ResultId,
    private readonly caseIdValue: CaseId,
    private readonly evalRunIdValue: EvalRunId,
    private readonly updatedAtValue: Timestamp,
    private readonly scoreValue: HumanScore,
    private readonly primitives: EvalAnnotationPrimitives,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalAnnotationPrimitives): EvalAnnotation {
    return new EvalAnnotation(
      ResultId.fromPrimitives(primitives.resultId),
      CaseId.fromPrimitives(primitives.caseId),
      EvalRunId.fromPrimitives(primitives.runId),
      Timestamp.fromPrimitives(primitives.updatedAt),
      HumanScore.fromPrimitives(primitives.score),
      primitives,
    );
  }

  get score(): HumanScore {
    return this.scoreValue;
  }

  toPrimitives(): EvalAnnotationPrimitives {
    return {
      ...this.primitives,
      resultId: this.resultIdValue.toPrimitives(),
      caseId: this.caseIdValue.toPrimitives(),
      runId: this.evalRunIdValue.toPrimitives(),
      updatedAt: this.updatedAtValue.toPrimitives(),
      score: this.scoreValue.toPrimitives(),
    };
  }
}
