import { DirectoryListing } from "../value-objects/directory-listing.value-object";
import { ProjectDirectory } from "../value-objects/project-directory.value-object";

export interface DirectoryBrowserService {
  browse(directory: ProjectDirectory): Promise<DirectoryListing>;
}
