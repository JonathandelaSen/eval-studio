import { describe, expect, it } from "vitest";
import { EvalSuite } from "./eval-suite.entity";
import { SuiteId } from "../value-objects/suite-id.value-object";
import { SuiteName } from "../value-objects/suite-name.value-object";
import { SuiteDescriptionNullable } from "../value-objects/suite-description-nullable.value-object";
import { CaseIds } from "../value-objects/case-ids.value-object";
import { SchemaVersion } from "../value-objects/schema-version.value-object";

describe("EvalSuite", () => {
  it("creates an empty suite", () => {
    const suite = EvalSuite.create({
      id: SuiteId.fromPrimitives("550e8400-e29b-41d4-a716-446655440000"),
      name: SuiteName.fromPrimitives("Support answers"),
      description: SuiteDescriptionNullable.fromPrimitives("Grounded support scenarios"),
      caseIds: CaseIds.fromPrimitives([]),
      schemaVersion: SchemaVersion.current(),
    });

    expect(suite.toPrimitives()).toEqual({
      schemaVersion: "1",
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Support answers",
      description: "Grounded support scenarios",
      caseIds: [],
    });
  });

  it("owns a case exactly once", () => {
    const suite = EvalSuite.fromPrimitives({
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Support answers",
      caseIds: [],
    });

    suite.addCase("987f6543-e21b-32d1-b654-246614174111");
    suite.addCase("987f6543-e21b-32d1-b654-246614174111");

    expect(suite.toPrimitives().caseIds).toEqual([
      "987f6543-e21b-32d1-b654-246614174111",
    ]);
  });
});
