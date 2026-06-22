import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import type { EvalResultPrimitives as EvalResultArtifactPrimitives } from "@/backend/modules/eval-workspace";
import { CaseId } from "../value-objects/case-id.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { ResultId } from "../value-objects/result-id.value-object";
import { RunId } from "../value-objects/run-id.value-object";

export interface EvalResultPrimitives {
  schemaVersion: "1";
  resultId: string;
  caseId: string;
  runId: string;
  producer: string;
  createdAt: string;
  runtime?: EvalResultArtifactPrimitives["runtime"];
  promptVariables?: EvalResultArtifactPrimitives["promptVariables"];
  renderedPrompt: EvalResultArtifactPrimitives["renderedPrompt"];
  rawOutput: unknown | null;
  parsedOutput: unknown | null;
  status: "completed" | "failed";
  error: EvalResultArtifactPrimitives["error"];
  usage?: EvalResultArtifactPrimitives["usage"];
  latencyMs?: number | null;
}

export class EvalResult extends AggregateRoot {
  private constructor(
    private readonly resultIdValue: ResultId,
    private readonly caseIdValue: CaseId,
    private readonly runIdValue: RunId,
    private readonly producerValue: Producer,
    private readonly createdAtValue: Timestamp,
    private readonly primitives: EvalResultPrimitives,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalResultPrimitives): EvalResult {
    return new EvalResult(
      ResultId.fromPrimitives(primitives.resultId),
      CaseId.fromPrimitives(primitives.caseId),
      RunId.fromPrimitives(primitives.runId),
      Producer.fromPrimitives(primitives.producer),
      Timestamp.fromPrimitives(primitives.createdAt),
      primitives,
    );
  }

  toPrimitives(): EvalResultPrimitives {
    return {
      ...this.primitives,
      resultId: this.resultIdValue.toPrimitives(),
      caseId: this.caseIdValue.toPrimitives(),
      runId: this.runIdValue.toPrimitives(),
      producer: this.producerValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
    };
  }
}
