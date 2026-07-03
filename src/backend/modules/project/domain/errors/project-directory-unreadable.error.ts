import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class ProjectDirectoryUnreadableError extends DomainError {
  constructor(message = "Choose a readable directory.") {
    super(ErrorCode.PROJECT_DIRECTORY_UNREADABLE, message);
    this.name = "ProjectDirectoryUnreadableError";
  }
}
