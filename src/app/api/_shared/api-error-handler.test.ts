import { describe, expect, it } from "vitest";
import { z } from "zod";
import { handleApiError } from "./api-error-handler";

describe("handleApiError", () => {
  it("maps schema errors to an invalid request without losing issue details", async () => {
    const schema = z.object({ name: z.string() });
    const error = schema.safeParse({ name: 1 }).error;
    if (!error) throw new Error("Expected schema validation to fail.");

    const response = handleApiError(error);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "invalid_request", details: error.issues },
    });
  });

  it("does not leak unknown error details", async () => {
    const response = handleApiError(
      new Error("ENOENT: /Users/jon/private/settings.json"),
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: {
        code: "internal_error",
        message: "An unexpected error occurred.",
      },
    });
    expect(JSON.stringify(body)).not.toContain("/Users/jon");
  });

  it("maps DomainError subclasses to HTTP status codes and payloads", async () => {
    const { DomainError } = await import("@/backend/modules/shared");
    const { ErrorCode } = await import("@/shared/error-codes");

    class DummyNotFoundError extends DomainError {
      constructor() {
        super(ErrorCode.NOT_FOUND, "Developer-facing message", { someId: 123 });
        this.name = "DummyNotFoundError";
      }
    }
    const response = handleApiError(new DummyNotFoundError());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Developer-facing message",
        details: { someId: 123 },
      },
    });
  });

  it("maps generic DomainError to status 400", async () => {
    const { DomainError } = await import("@/backend/modules/shared");
    const { ErrorCode } = await import("@/shared/error-codes");

    class DummyBadRequestError extends DomainError {
      constructor() {
        super(ErrorCode.BAD_REQUEST, "Developer-facing message");
        this.name = "DummyBadRequestError";
      }
    }
    const response = handleApiError(new DummyBadRequestError());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Developer-facing message",
      },
    });
  });
});
