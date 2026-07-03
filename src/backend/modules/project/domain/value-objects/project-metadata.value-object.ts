import { ValueObject } from "@/backend/modules/shared";
import { ProjectDirectory } from "./project-directory.value-object";
import { ProjectName } from "./project-name.value-object";

export interface ProjectMetadataPrimitives extends Record<string, unknown> {
  name: string;
  directory: string;
}

export class ProjectMetadata extends ValueObject<ProjectMetadataPrimitives> {
  private constructor(
    private readonly name: ProjectName,
    private readonly directory: ProjectDirectory,
  ) {
    super();
  }

  static fromPrimitives(value: ProjectMetadataPrimitives): ProjectMetadata {
    return new ProjectMetadata(
      ProjectName.fromPrimitives(value.name),
      ProjectDirectory.fromPrimitives(value.directory),
    );
  }

  toPrimitives(): ProjectMetadataPrimitives {
    return {
      name: this.name.toPrimitives(),
      directory: this.directory.toPrimitives(),
    };
  }
}
