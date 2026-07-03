import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import { CaseIds } from "../value-objects/case-ids.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { RunName } from "../value-objects/run-name.value-object";
import { RunNotesNullable } from "../value-objects/run-notes-nullable.value-object";
import { SuiteId } from "../value-objects/suite-id.value-object";
import { EvalRuntimeNullable } from "../value-objects/eval-runtime-nullable.value-object";
import type { EvalRuntimePrimitives } from "../value-objects/eval-runtime.value-object";
import { EvalRunCreatedEvent } from "../events/eval-run-created.event";
import { EvalRunStatus, type EvalRunStatusPrimitives } from "../value-objects/eval-run-status.value-object";

export interface EvalRunPrimitives {
  runId: string;
  name: string;
  suiteId: string;
  producer: string;
  createdAt: string;
  caseIds: string[];
  runtime: EvalRuntimePrimitives | null;
  notes: string | null;
  status: EvalRunStatusPrimitives;
}

export interface EvalRunCreateParams {
  id: EvalRunId;
  name: RunName;
  suiteId: SuiteId;
  producer: Producer;
  createdAt: Timestamp;
  caseIds: CaseIds;
  runtime: EvalRuntimeNullable;
  notes: RunNotesNullable;
}

export class EvalRun extends AggregateRoot {
  private constructor(
    private readonly evalRunIdValue: EvalRunId,
    private readonly nameValue: RunName,
    private readonly suiteIdValue: SuiteId,
    private readonly producerValue: Producer,
    private readonly createdAtValue: Timestamp,
    private readonly caseIdsValue: CaseIds,
    private readonly runtimeValue: EvalRuntimeNullable,
    private readonly notesValue: RunNotesNullable,
    private statusValue: EvalRunStatus,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalRunPrimitives): EvalRun {
    return new EvalRun(
      EvalRunId.fromPrimitives(primitives.runId),
      RunName.fromPrimitives(primitives.name),
      SuiteId.fromPrimitives(primitives.suiteId),
      Producer.fromPrimitives(primitives.producer),
      Timestamp.fromPrimitives(primitives.createdAt),
      CaseIds.fromPrimitives(primitives.caseIds),
      EvalRuntimeNullable.fromPrimitives(primitives.runtime),
      RunNotesNullable.fromPrimitives(primitives.notes),
      EvalRunStatus.fromPrimitives(primitives.status),
    );
  }

  static create(input: EvalRunCreateParams): EvalRun {
    const evalRun = new EvalRun(
      input.id,
      input.name,
      input.suiteId,
      input.producer,
      input.createdAt,
      input.caseIds,
      input.runtime,
      input.notes,
      EvalRunStatus.queued(),
    );
    evalRun.recordDomainEvent(new EvalRunCreatedEvent(evalRun.toPrimitives()));
    return evalRun;
  }

  get id(): EvalRunId {
    return this.evalRunIdValue;
  }

  get suiteId(): SuiteId {
    return this.suiteIdValue;
  }

  markRunning(): void {
    this.statusValue = EvalRunStatus.running();
  }

  markCompleted(hasFailures: boolean): void {
    this.statusValue = EvalRunStatus.completed(hasFailures);
  }

  markInterrupted(): void {
    this.statusValue = EvalRunStatus.interrupted();
  }

  toPrimitives(): EvalRunPrimitives {
    return {
      runId: this.evalRunIdValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      suiteId: this.suiteIdValue.toPrimitives(),
      producer: this.producerValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
      caseIds: this.caseIdsValue.toPrimitives(),
      runtime: this.runtimeValue.toPrimitives(),
      notes: this.notesValue.toPrimitives(),
      status: this.statusValue.toPrimitives(),
    };
  }
}
