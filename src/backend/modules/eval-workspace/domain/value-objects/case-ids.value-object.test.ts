import { describe, expect, it } from "vitest";
import { CaseIds } from "./case-ids.value-object";
import { CaseId } from "./case-id.value-object";
describe("CaseIds", () => { it("adds a case once", () => { const id = "550e8400-e29b-41d4-a716-446655440000"; expect(CaseIds.fromPrimitives([]).add(CaseId.fromPrimitives(id)).add(CaseId.fromPrimitives(id)).toPrimitives()).toEqual([id]); }); });
