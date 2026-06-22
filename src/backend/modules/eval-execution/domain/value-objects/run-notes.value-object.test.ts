import { describe, expect, it } from "vitest";
import { RunNotes } from "./run-notes.value-object";

describe("RunNotes", () => {
  it("creates RunNotes and round-trips them", () => {
    expect(RunNotes.fromPrimitives(" These are some notes. ").toPrimitives()).toBe("These are some notes.");
  });

  it("throws when notes are empty", () => {
    expect(() => RunNotes.fromPrimitives("   ")).toThrow("Notes cannot be empty.");
  });
});
