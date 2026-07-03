import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class WorkspaceJsonFileNotFoundError extends DomainError {
  constructor() {
    super(
      ErrorCode.WORKSPACE_JSON_FILE_NOT_FOUND,
      "JSON file does not exist in the workspace.",
    );
  }
}
