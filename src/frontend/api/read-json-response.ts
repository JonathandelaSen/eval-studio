type ErrorPayload = {
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
};

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  try {
    const payload = (await response.json()) as ErrorPayload;
    if (
      payload.error &&
      typeof payload.error.code === "string" &&
      typeof payload.error.message === "string"
    ) {
      throw new ApiClientError(
        response.status,
        payload.error.code,
        payload.error.message,
        payload.error.details,
      );
    }
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
  }
  throw new ApiClientError(
    response.status,
    "request_failed",
    "The request could not be completed.",
  );
}
