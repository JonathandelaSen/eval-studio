import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class ProjectNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.PROJECT_NOT_FOUND, "Project does not exist.");
    this.name = "ProjectNotFoundError";
  }
}
