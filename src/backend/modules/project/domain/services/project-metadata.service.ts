import { ProjectDirectory } from "../value-objects/project-directory.value-object";
import { ProjectMetadata } from "../value-objects/project-metadata.value-object";

export interface ProjectMetadataService {
  inspect(directory: ProjectDirectory): Promise<ProjectMetadata>;
}
