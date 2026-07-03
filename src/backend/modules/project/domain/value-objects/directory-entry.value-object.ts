import { ValueObject } from "@/backend/modules/shared";
import { DirectoryName } from "./directory-name.value-object";
import { ProjectDirectory } from "./project-directory.value-object";

export interface DirectoryEntryPrimitives extends Record<string, unknown> {
  name: string;
  path: string;
}

export class DirectoryEntry extends ValueObject<DirectoryEntryPrimitives> {
  private constructor(
    private readonly name: DirectoryName,
    private readonly path: ProjectDirectory,
  ) { super(); }
  static fromPrimitives(value: DirectoryEntryPrimitives): DirectoryEntry {
    return new DirectoryEntry(DirectoryName.fromPrimitives(value.name), ProjectDirectory.fromPrimitives(value.path));
  }
  toPrimitives(): DirectoryEntryPrimitives { return { name: this.name.toPrimitives(), path: this.path.toPrimitives() }; }
}
