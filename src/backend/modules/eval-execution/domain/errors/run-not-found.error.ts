import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class RunNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.RUN_NOT_FOUND, "Run does not exist.");
    this.name = "RunNotFoundError";
  }
}
