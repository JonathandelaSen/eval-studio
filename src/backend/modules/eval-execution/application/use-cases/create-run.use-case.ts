import { Timestamp, type EventBus } from "@/backend/modules/shared";
import { EvalRun } from "../../domain/entities/eval-run.entity";
import { CaseIds } from "../../domain/value-objects/case-ids.value-object";
import { EvalModel } from "../../domain/value-objects/eval-model.value-object";
import { EvalProvider, type EvalProviderPrimitives } from "../../domain/value-objects/eval-provider.value-object";
import { Producer } from "../../domain/value-objects/producer.value-object";
import { EvalRunId } from "../../domain/value-objects/eval-run-id.value-object";
import { RunName } from "../../domain/value-objects/run-name.value-object";
import { EvalTemperatureNullable } from "../../domain/value-objects/eval-temperature-nullable.value-object";
import { EvalRuntime } from "../../domain/value-objects/eval-runtime.value-object";
import { EvalRuntimeNullable } from "../../domain/value-objects/eval-runtime-nullable.value-object";
import { RunNotesNullable } from "../../domain/value-objects/run-notes-nullable.value-object";
import { SuiteId } from "../../domain/value-objects/suite-id.value-object";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

export type CreateRunInput = {
  workspaceRoot?: string;
  name: string;
  suiteId: string;
  caseIds: string[];
  provider: EvalProviderPrimitives;
  model: string;
  temperature?: number;
};

export class CreateRunUseCase {
  constructor(
    private readonly deps: { runRepository: EvalRunRepository; eventBus: EventBus },
  ) {}

  async execute(input: CreateRunInput): Promise<EvalRun> {
    const createdAt = Timestamp.now();
    const producer = Producer.evalStudio();
    const provider = EvalProvider.fromPrimitives(input.provider);
    const model = EvalModel.fromPrimitives(input.model);
    const temperature = EvalTemperatureNullable.fromPrimitives(input.temperature);
    const run = EvalRun.create({
      id: EvalRunId.create({ createdAt, producer, provider, model }),
      name: RunName.fromPrimitives(input.name),
      suiteId: SuiteId.fromPrimitives(input.suiteId),
      producer,
      createdAt,
      caseIds: CaseIds.fromPrimitives(input.caseIds),
      runtime: EvalRuntimeNullable.fromValue(
        EvalRuntime.create({ provider, model, temperature }),
      ),
      notes: RunNotesNullable.empty(),
    });
    const root = input.workspaceRoot
      ? WorkspaceRoot.fromPrimitives(input.workspaceRoot)
      : undefined;
    await this.deps.runRepository.save(root, run);
    await this.deps.eventBus.publish(run.pullDomainEvents());
    return run;
  }
}
