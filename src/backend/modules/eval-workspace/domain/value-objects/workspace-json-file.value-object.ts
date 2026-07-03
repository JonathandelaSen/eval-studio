import { ValueObject } from "@/backend/modules/shared";
import { WorkspaceJsonFileInvalidError } from "../errors/workspace-json-file-invalid.error";

const INVALID_PATH_MESSAGE = "Choose a JSON file inside the workspace.";
const INVALID_JSON_MESSAGE = "The file must contain valid JSON.";
const PATH_SEPARATOR = "/";
const WINDOWS_PATH_SEPARATOR = "\\";
const JSON_EXTENSION = ".json";
const CURRENT_DIRECTORY = ".";
const PARENT_DIRECTORY = "..";

export interface WorkspaceJsonFilePrimitives {
  path: string;
  content: string;
}

class WorkspaceJsonFilePath extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    const segments = value.split(PATH_SEPARATOR);
    const invalid =
      !value ||
      value.startsWith(PATH_SEPARATOR) ||
      value.includes(WINDOWS_PATH_SEPARATOR) ||
      !value.endsWith(JSON_EXTENSION) ||
      segments.some(
        (segment) =>
          !segment ||
          segment === CURRENT_DIRECTORY ||
          segment === PARENT_DIRECTORY,
      );
    if (invalid) throw new WorkspaceJsonFileInvalidError(INVALID_PATH_MESSAGE);
  }

  static fromPrimitives(value: string): WorkspaceJsonFilePath {
    return new WorkspaceJsonFilePath(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}

class WorkspaceJsonFileContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): WorkspaceJsonFileContent {
    return new WorkspaceJsonFileContent(value);
  }

  static fromValidJson(value: string): WorkspaceJsonFileContent {
    try {
      JSON.parse(value);
    } catch {
      throw new WorkspaceJsonFileInvalidError(INVALID_JSON_MESSAGE);
    }
    return new WorkspaceJsonFileContent(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}

export class WorkspaceJsonFile extends ValueObject<WorkspaceJsonFilePrimitives> {
  private constructor(
    private readonly pathValue: WorkspaceJsonFilePath,
    private readonly contentValue: WorkspaceJsonFileContent,
  ) {
    super();
  }

  static fromPrimitives(
    value: WorkspaceJsonFilePrimitives,
  ): WorkspaceJsonFile {
    return new WorkspaceJsonFile(
      WorkspaceJsonFilePath.fromPrimitives(value.path),
      WorkspaceJsonFileContent.fromPrimitives(value.content),
    );
  }

  static fromValidJson(
    value: WorkspaceJsonFilePrimitives,
  ): WorkspaceJsonFile {
    return new WorkspaceJsonFile(
      WorkspaceJsonFilePath.fromPrimitives(value.path),
      WorkspaceJsonFileContent.fromValidJson(value.content),
    );
  }

  toPrimitives(): WorkspaceJsonFilePrimitives {
    return {
      path: this.pathValue.toPrimitives(),
      content: this.contentValue.toPrimitives(),
    };
  }
}
