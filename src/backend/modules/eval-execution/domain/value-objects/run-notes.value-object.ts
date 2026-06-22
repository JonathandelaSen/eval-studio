import { ValueObject } from "@/backend/modules/shared";

class RunNotesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunNotesError";
  }
}

const EMPTY_NOTES_MESSAGE = "Notes cannot be empty.";

export class RunNotes extends ValueObject<string> {
  private readonly value: string;

  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new RunNotesError(EMPTY_NOTES_MESSAGE);
    }
    this.value = trimmed;
  }

  static fromPrimitives(value: string): RunNotes {
    return new RunNotes(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
