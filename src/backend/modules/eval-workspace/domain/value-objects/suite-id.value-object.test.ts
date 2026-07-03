import { describe, expect, it } from "vitest";
import { SuiteId } from "./suite-id.value-object";
describe("SuiteId", () => { it("accepts stable IDs", () => { const id = "glideboard.phrase-completion"; expect(SuiteId.fromPrimitives(id).toPrimitives()).toBe(id); }); });
