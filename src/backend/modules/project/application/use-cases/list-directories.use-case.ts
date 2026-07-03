import { DirectoryListing } from "../../domain/value-objects/directory-listing.value-object";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import type { DirectoryBrowserService } from "../../domain/services/directory-browser.service";

export type ListDirectoriesInput = { directory?: string };

export class ListDirectoriesUseCase {
  constructor(
    private readonly deps: {
      directoryBrowserService: DirectoryBrowserService;
      homeDirectory: ProjectDirectory;
    },
  ) {}

  execute(input: ListDirectoriesInput): Promise<DirectoryListing> {
    const directory = input.directory
      ? ProjectDirectory.fromPrimitives(input.directory)
      : this.deps.homeDirectory;
    return this.deps.directoryBrowserService.browse(directory);
  }
}
