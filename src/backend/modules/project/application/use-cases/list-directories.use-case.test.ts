import { describe, expect, it } from "vitest";
import type { DirectoryBrowserService } from "../../domain/services/directory-browser.service";
import { DirectoryListing } from "../../domain/value-objects/directory-listing.value-object";
import { ProjectDirectory } from "../../domain/value-objects/project-directory.value-object";
import { ListDirectoriesUseCase } from "./list-directories.use-case";

describe("ListDirectoriesUseCase", () => {
  it("uses the configured home directory when no path is provided", async () => {
    const browser = new RecordingDirectoryBrowserService();
    const useCase = new ListDirectoriesUseCase({
      directoryBrowserService: browser,
      homeDirectory: ProjectDirectory.fromPrimitives("/Users/jon"),
    });

    await useCase.execute({});

    expect(browser.directory?.toPrimitives()).toBe("/Users/jon");
  });

  it("uses the requested directory", async () => {
    const browser = new RecordingDirectoryBrowserService();
    const useCase = new ListDirectoriesUseCase({
      directoryBrowserService: browser,
      homeDirectory: ProjectDirectory.fromPrimitives("/Users/jon"),
    });

    await useCase.execute({ directory: "/tmp/evals" });

    expect(browser.directory?.toPrimitives()).toBe("/tmp/evals");
  });
});

class RecordingDirectoryBrowserService implements DirectoryBrowserService {
  directory?: ProjectDirectory;
  browse(directory: ProjectDirectory): Promise<DirectoryListing> {
    this.directory = directory;
    return Promise.resolve(
      DirectoryListing.fromPrimitives({
        current: directory.toPrimitives(),
        parent: null,
        directories: [],
      }),
    );
  }
}
