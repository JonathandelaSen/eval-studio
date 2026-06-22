import { ValueObject } from "@/backend/modules/shared";
import { RunNotes } from "./run-notes.value-object";

const EMPTY_STRING = "";

export class RunNotesNullable extends ValueObject<string | null> {
  private constructor(private readonly value: RunNotes | null) {
    super();
  }

  static fromPrimitives(value: string | null | undefined): RunNotesNullable {
    if (value === undefined || value === null || value.trim() === EMPTY_STRING) {
      return new RunNotesNullable(null);
    }
    return new RunNotesNullable(RunNotes.fromPrimitives(value));
  }

  static fromValue(value: RunNotes | null): RunNotesNullable {
    return new RunNotesNullable(value);
  }

  static empty(): RunNotesNullable {
    return new RunNotesNullable(null);
  }

  toPrimitives(): string | null {
    return this.value ? this.value.toPrimitives() : null;
  }

  get valueValue(): RunNotes | null {
    return this.value;
  }

  get isNull(): boolean {
    return this.value === null;
  }
}
