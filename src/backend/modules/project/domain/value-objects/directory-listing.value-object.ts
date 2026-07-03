import { ValueObject } from "@/backend/modules/shared";
import { DirectoryEntries } from "./directory-entries.value-object";
import type { DirectoryEntryPrimitives } from "./directory-entry.value-object";
import { ProjectDirectoryNullable } from "./project-directory-nullable.value-object";
import { ProjectDirectory } from "./project-directory.value-object";

export interface DirectoryListingPrimitives extends Record<string, unknown> {
  current: string;
  parent: string | null;
  directories: DirectoryEntryPrimitives[];
}

export class DirectoryListing extends ValueObject<DirectoryListingPrimitives> {
  private constructor(
    private readonly current: ProjectDirectory,
    private readonly parent: ProjectDirectoryNullable,
    private readonly directories: DirectoryEntries,
  ) {
    super();
  }

  static fromPrimitives(value: DirectoryListingPrimitives): DirectoryListing {
    return new DirectoryListing(
      ProjectDirectory.fromPrimitives(value.current),
      ProjectDirectoryNullable.fromPrimitives(value.parent),
      DirectoryEntries.fromPrimitives(value.directories),
    );
  }

  toPrimitives(): DirectoryListingPrimitives {
    return {
      current: this.current.toPrimitives(),
      parent: this.parent.toPrimitives(),
      directories: this.directories.toPrimitives(),
    };
  }
}
