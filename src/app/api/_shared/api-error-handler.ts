import { ZodError } from "zod";
import { errorResponse } from "./api-responses";
import { DomainError } from "@/backend/modules/shared";

export function handleApiError(error: unknown): Response {
  if (error instanceof ZodError) {
    return errorResponse({
      status: 400,
      code: "invalid_request",
      message: "The request is invalid.",
      details: error.issues,
    });
  }

  if (error instanceof DomainError) {
    const isNotFound = error.name.endsWith("NotFoundError");
    return errorResponse({
      status: isNotFound ? 404 : 400,
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  return errorResponse({
    status: 500,
    code: "internal_error",
    message: "An unexpected error occurred.",
  });
}

