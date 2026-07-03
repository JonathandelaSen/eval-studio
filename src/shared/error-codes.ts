/**
 * Framework-neutral error code registry shared by backend and frontend.
 *
 * This module must stay a dependency-free leaf: no Next.js or `@/backend/modules` imports.
 * Both domain errors (backend) and the frontend error handlers import from here,
 * so it is the single source of truth.
 */

export const ErrorCode = {
  // Generic, derived from HTTP status when no semantic code is provided.
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INTERNAL: "INTERNAL",

  // App-specific domain errors
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  PROJECT_DIRECTORY_UNREADABLE: "PROJECT_DIRECTORY_UNREADABLE",
  RUN_NOT_FOUND: "RUN_NOT_FOUND",
  CASE_NOT_FOUND: "CASE_NOT_FOUND",
  WORKSPACE_JSON_FILE_INVALID: "WORKSPACE_JSON_FILE_INVALID",
  WORKSPACE_JSON_FILE_NOT_FOUND: "WORKSPACE_JSON_FILE_NOT_FOUND",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ErrorResponseBody {
  error: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
}

const ERROR_CODE_VALUES = new Set<string>(Object.values(ErrorCode));

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && ERROR_CODE_VALUES.has(value);
}

export function defaultErrorCodeForStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    default:
      return ErrorCode.INTERNAL;
  }
}
