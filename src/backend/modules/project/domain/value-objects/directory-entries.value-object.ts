import { ValueObject } from "@/backend/modules/shared";
import { DirectoryEntry, type DirectoryEntryPrimitives } from "./directory-entry.value-object";

export class DirectoryEntries extends ValueObject<DirectoryEntryPrimitives[]> {
  private constructor(private readonly entries: DirectoryEntry[]) { super(); }
  static fromPrimitives(value: DirectoryEntryPrimitives[]): DirectoryEntries {
    return new DirectoryEntries(value.map(DirectoryEntry.fromPrimitives));
  }
  toPrimitives(): DirectoryEntryPrimitives[] { return this.entries.map((entry) => entry.toPrimitives()); }
}
