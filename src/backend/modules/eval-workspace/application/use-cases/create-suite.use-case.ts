import { randomUUID } from "node:crypto";
import { EvalSuite } from "../../domain/entities/eval-suite.entity";
import type { EvalSuiteRepository } from "../../domain/repositories/eval-suite.repository";
import { WorkspaceRoot } from "../../domain/value-objects/workspace-root.value-object";
import { SuiteId } from "../../domain/value-objects/suite-id.value-object";
import { SuiteName } from "../../domain/value-objects/suite-name.value-object";
import { SuiteDescriptionNullable } from "../../domain/value-objects/suite-description-nullable.value-object";
import { CaseIds } from "../../domain/value-objects/case-ids.value-object";
import { SchemaVersion } from "../../domain/value-objects/schema-version.value-object";

export class CreateSuiteUseCase {
  constructor(
    private readonly deps: { suiteRepository: EvalSuiteRepository; idFactory?: () => string },
  ) {}

  execute(input: { workspaceRoot?: string; name: string; description?: string }): Promise<EvalSuite> {
    const suite = EvalSuite.create({
      id: SuiteId.fromPrimitives((this.deps.idFactory ?? randomUUID)()),
      name: SuiteName.fromPrimitives(input.name),
      description: SuiteDescriptionNullable.fromPrimitives(input.description),
      caseIds: CaseIds.fromPrimitives([]),
      schemaVersion: SchemaVersion.current(),
    });
    return this.deps.suiteRepository.save(
      input.workspaceRoot ? WorkspaceRoot.fromPrimitives(input.workspaceRoot) : undefined,
      suite,
    );
  }
}
