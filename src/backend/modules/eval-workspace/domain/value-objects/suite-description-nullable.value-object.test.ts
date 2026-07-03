import { describe, expect, it } from "vitest";
import { SuiteDescriptionNullable } from "./suite-description-nullable.value-object";
describe("SuiteDescriptionNullable", () => { it("normalizes blank descriptions", () => expect(SuiteDescriptionNullable.fromPrimitives(" ").toPrimitives()).toBeNull()); });
