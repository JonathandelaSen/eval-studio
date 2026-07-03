import { ErrorCode } from "@/shared/error-codes";

/**
 * Base class for domain errors. Subclasses carry a stable machine-readable
 * `code` (mapped to localized copy by the frontend) and an optional `details`
 * payload for interpolation or UI. The `message` passed to `super(...)` is a
 * developer-facing English string for logs/Sentry and is never displayed.
 */
export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }
}
