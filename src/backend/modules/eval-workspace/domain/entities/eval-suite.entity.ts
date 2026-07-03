import { AggregateRoot } from "@/backend/modules/shared";
import { CaseId } from "../value-objects/case-id.value-object";
import { CaseIds } from "../value-objects/case-ids.value-object";
import { SuiteDescriptionNullable } from "../value-objects/suite-description-nullable.value-object";
import { SuiteId } from "../value-objects/suite-id.value-object";
import { SuiteName } from "../value-objects/suite-name.value-object";
import { SchemaVersion } from "../value-objects/schema-version.value-object";

export interface EvalSuitePrimitives extends Record<string, unknown> {
  suiteId: string;
  name: string;
  description?: string;
  caseIds: string[];
}

export interface EvalSuiteCreateParams {
  id: SuiteId;
  name: SuiteName;
  description: SuiteDescriptionNullable;
  caseIds: CaseIds;
  schemaVersion: SchemaVersion;
}

export class EvalSuite extends AggregateRoot {
  private constructor(
    private readonly idValue: SuiteId,
    private readonly nameValue: SuiteName,
    private readonly descriptionValue: SuiteDescriptionNullable,
    private caseIdsValue: CaseIds,
    private readonly schemaVersionValue: SchemaVersion,
  ) { super(); }

  static create(input: EvalSuiteCreateParams): EvalSuite {
    return new EvalSuite(input.id, input.name, input.description, input.caseIds, input.schemaVersion);
  }

  static fromPrimitives(value: EvalSuitePrimitives): EvalSuite {
    return new EvalSuite(
      SuiteId.fromPrimitives(value.suiteId),
      SuiteName.fromPrimitives(value.name),
      SuiteDescriptionNullable.fromPrimitives(value.description),
      CaseIds.fromPrimitives(value.caseIds),
      SchemaVersion.fromPrimitives(typeof value.schemaVersion === "string" ? value.schemaVersion : undefined),
    );
  }

  get id(): SuiteId { return this.idValue; }
  addCase(caseId: string): void { this.caseIdsValue = this.caseIdsValue.add(CaseId.fromPrimitives(caseId)); }
  removeCase(caseId: string): void { this.caseIdsValue = this.caseIdsValue.remove(CaseId.fromPrimitives(caseId)); }

  toPrimitives(): EvalSuitePrimitives {
    const description = this.descriptionValue.toPrimitives();
    return {
      schemaVersion: this.schemaVersionValue.toPrimitives(),
      suiteId: this.idValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      ...(description ? { description } : {}),
      caseIds: this.caseIdsValue.toPrimitives(),
    };
  }
}
