import { describe, expect, it } from "vitest";
import { SuiteName } from "./suite-name.value-object";
describe("SuiteName", () => { it("trims a name", () => expect(SuiteName.fromPrimitives(" Suite ").toPrimitives()).toBe("Suite")); });
