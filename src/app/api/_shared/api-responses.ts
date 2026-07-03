export type ApiErrorDescriptor = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T): Response {
  return Response.json(data, { status: 200 });
}

export function created<T>(data: T): Response {
  return Response.json(data, { status: 201 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function errorResponse(error: ApiErrorDescriptor): Response {
  const body: ApiErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    },
  };
  return Response.json(body, { status: error.status });
}
