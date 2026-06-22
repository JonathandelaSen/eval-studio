import { describe, expect, it } from "vitest";
import { StringId } from "./string-id.value-object";

describe("StringId", () => {
  it("round-trips a non-empty id", () => {
    expect(StringId.fromPrimitives("id-1").toPrimitives()).toBe("id-1");
  });

  it("rejects empty ids", () => {
    expect(() => StringId.fromPrimitives("")).toThrow();
  });
});
