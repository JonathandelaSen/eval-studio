import { describe, expect, it } from "vitest";
import { RunNotes } from "./run-notes.value-object";
import { RunNotesNullable } from "./run-notes-nullable.value-object";

describe("RunNotesNullable", () => {
  it("can wrap active notes and serialize them", () => {
    const inner = RunNotes.fromPrimitives(" These are some notes. ");
    const nullable = RunNotesNullable.fromValue(inner);

    expect(nullable.isNull).toBe(false);
    expect(nullable.valueValue).toBe(inner);
    expect(nullable.toPrimitives()).toBe("These are some notes.");
  });

  it("can represent an empty/null notes", () => {
    const nullable = RunNotesNullable.empty();

    expect(nullable.isNull).toBe(true);
    expect(nullable.valueValue).toBeNull();
    expect(nullable.toPrimitives()).toBeNull();
  });

  it("can be created from null/undefined/empty primitives", () => {
    expect(RunNotesNullable.fromPrimitives(null).isNull).toBe(true);
    expect(RunNotesNullable.fromPrimitives(undefined).isNull).toBe(true);
    expect(RunNotesNullable.fromPrimitives("   ").isNull).toBe(true);
  });

  it("can be created from valid primitives", () => {
    const nullable = RunNotesNullable.fromPrimitives("Hello notes");
    expect(nullable.isNull).toBe(false);
    expect(nullable.toPrimitives()).toBe("Hello notes");
  });
});
