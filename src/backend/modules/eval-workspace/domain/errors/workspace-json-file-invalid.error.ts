import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class WorkspaceJsonFileInvalidError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.WORKSPACE_JSON_FILE_INVALID, message);
  }
}
