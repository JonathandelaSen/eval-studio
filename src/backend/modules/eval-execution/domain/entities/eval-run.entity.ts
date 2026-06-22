import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import { ActionId } from "../value-objects/action-id.value-object";
import { CaseIds } from "../value-objects/case-ids.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { RunName } from "../value-objects/run-name.value-object";
import { RunNotesNullable } from "../value-objects/run-notes-nullable.value-object";
import { SuiteIdNullable } from "../value-objects/suite-id-nullable.value-object";
import { EvalRuntimeNullable } from "../value-objects/eval-runtime-nullable.value-object";
import type { EvalRuntimePrimitives } from "../value-objects/eval-runtime.value-object";
import { EvalRunCreatedEvent } from "../events/eval-run-created.event";

export interface EvalRunPrimitives {
  runId: string;
  name: string;
  actionId: string;
  producer: string;
  createdAt: string;
  caseIds: string[];
  runtime: EvalRuntimePrimitives | null;
  notes: string | null;
  suiteId: string | null;
}

export interface EvalRunCreateParams {
  id: EvalRunId;
  name: RunName;
  actionId: ActionId;
  producer: Producer;
  createdAt: Timestamp;
  caseIds: CaseIds;
  runtime: EvalRuntimeNullable;
  notes: RunNotesNullable;
  suiteId: SuiteIdNullable;
}

export class EvalRun extends AggregateRoot {
  private constructor(
    private readonly evalRunIdValue: EvalRunId,
    private readonly nameValue: RunName,
    private readonly actionIdValue: ActionId,
    private readonly producerValue: Producer,
    private readonly createdAtValue: Timestamp,
    private readonly caseIdsValue: CaseIds,
    private readonly runtimeValue: EvalRuntimeNullable,
    private readonly notesValue: RunNotesNullable,
    private readonly suiteIdValue: SuiteIdNullable,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalRunPrimitives): EvalRun {
    return new EvalRun(
      EvalRunId.fromPrimitives(primitives.runId),
      RunName.fromPrimitives(primitives.name),
      ActionId.fromPrimitives(primitives.actionId),
      Producer.fromPrimitives(primitives.producer),
      Timestamp.fromPrimitives(primitives.createdAt),
      CaseIds.fromPrimitives(primitives.caseIds),
      EvalRuntimeNullable.fromPrimitives(primitives.runtime),
      RunNotesNullable.fromPrimitives(primitives.notes),
      SuiteIdNullable.fromPrimitives(primitives.suiteId),
    );
  }

  static create(input: EvalRunCreateParams): EvalRun {
    const evalRun = new EvalRun(
      input.id,
      input.name,
      input.actionId,
      input.producer,
      input.createdAt,
      input.caseIds,
      input.runtime,
      input.notes,
      input.suiteId,
    );
    evalRun.recordDomainEvent(new EvalRunCreatedEvent(evalRun.toPrimitives()));
    return evalRun;
  }

  get id(): EvalRunId {
    return this.evalRunIdValue;
  }

  get actionId(): ActionId {
    return this.actionIdValue;
  }

  toPrimitives(): EvalRunPrimitives {
    return {
      runId: this.evalRunIdValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      actionId: this.actionIdValue.toPrimitives(),
      producer: this.producerValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
      caseIds: this.caseIdsValue.toPrimitives(),
      runtime: this.runtimeValue.toPrimitives(),
      notes: this.notesValue.toPrimitives(),
      suiteId: this.suiteIdValue.toPrimitives(),
    };
  }
}
