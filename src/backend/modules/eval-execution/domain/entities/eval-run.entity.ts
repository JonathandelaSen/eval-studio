import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import type { EvalRunPrimitives as EvalRunArtifactPrimitives } from "@/backend/modules/eval-workspace";
import { ActionId } from "../value-objects/action-id.value-object";
import { CaseId } from "../value-objects/case-id.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { RunId } from "../value-objects/run-id.value-object";

export interface EvalRunPrimitives {
  schemaVersion: "1";
  runId: string;
  name: string;
  actionId: string;
  producer: string;
  createdAt: string;
  caseIds: string[];
  runtime?: EvalRunArtifactPrimitives["runtime"];
  executionMode?: string;
  notes?: string;
  suiteId?: string;
}

export class EvalRun extends AggregateRoot {
  private constructor(
    private readonly runIdValue: RunId,
    private readonly actionIdValue: ActionId,
    private readonly producerValue: Producer,
    private readonly createdAtValue: Timestamp,
    private readonly caseIdValues: CaseId[],
    private readonly primitives: EvalRunPrimitives,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalRunPrimitives): EvalRun {
    return new EvalRun(
      RunId.fromPrimitives(primitives.runId),
      ActionId.fromPrimitives(primitives.actionId),
      Producer.fromPrimitives(primitives.producer),
      Timestamp.fromPrimitives(primitives.createdAt),
      primitives.caseIds.map(CaseId.fromPrimitives),
      primitives,
    );
  }

  get id(): RunId {
    return this.runIdValue;
  }

  get actionId(): ActionId {
    return this.actionIdValue;
  }

  toPrimitives(): EvalRunPrimitives {
    return {
      ...this.primitives,
      runId: this.runIdValue.toPrimitives(),
      actionId: this.actionIdValue.toPrimitives(),
      producer: this.producerValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
      caseIds: this.caseIdValues.map((caseId) => caseId.toPrimitives()),
    };
  }
}
