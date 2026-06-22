import { describe, expect, it } from "vitest";
import { CaseIds } from "./case-ids.value-object";
import { CaseId } from "./case-id.value-object";

describe("CaseIds", () => {
  const uuid1 = "550e8400-e29b-41d4-a716-446655440000";
  const uuid2 = "550e8400-e29b-41d4-a716-446655440001";

  it("round-trips a valid list of UUIDs", () => {
    const primitives = [uuid1, uuid2];
    const caseIds = CaseIds.fromPrimitives(primitives);
    expect(caseIds.toPrimitives()).toEqual(primitives);
  });

  it("can be constructed from CaseId instances", () => {
    const list = [CaseId.fromPrimitives(uuid1), CaseId.fromPrimitives(uuid2)];
    const caseIds = CaseIds.fromCaseIds(list);
    expect(caseIds.list).toEqual(list);
  });

  it("compares equality correctly", () => {
    const listA = CaseIds.fromPrimitives([uuid1, uuid2]);
    const listB = CaseIds.fromPrimitives([uuid1, uuid2]);
    const listC = CaseIds.fromPrimitives([uuid1]);

    expect(listA.equals(listB)).toBe(true);
    expect(listB.equals(listA)).toBe(true);
    expect(listA.equals(listC)).toBe(false);
  });

  it("throws an error when empty", () => {
    expect(() => CaseIds.fromPrimitives([])).toThrow("Case IDs list cannot be empty.");
  });
});
