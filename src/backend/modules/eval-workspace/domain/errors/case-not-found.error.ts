import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class CaseNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.CASE_NOT_FOUND, "Case does not exist.");
    this.name = "CaseNotFoundError";
  }
}
