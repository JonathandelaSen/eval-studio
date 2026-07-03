import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

const pathSchema = z
  .string()
  .min(1)
  .endsWith(".json")
  .refine(
    (value) =>
      !value.startsWith("/") &&
      !value.includes("\\") &&
      value.split("/").every((segment) => segment && segment !== "." && segment !== ".."),
    "Choose a JSON file inside the workspace.",
  );

const saveSchema = z.object({
  path: pathSchema,
  content: z.string(),
});

export interface ReadWorkspaceFileRequest {
  path: string;
}

export type SaveWorkspaceFileRequest = z.infer<typeof saveSchema>;

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiErrorDescriptor };

export function parseReadWorkspaceFileRequest(
  searchParams: URLSearchParams,
): ValidationResult<ReadWorkspaceFileRequest> {
  const parsed = pathSchema.safeParse(searchParams.get("path") ?? "");
  if (parsed.success) return { ok: true, value: { path: parsed.data } };
  return invalidFileRequest(parsed.error.issues);
}

export function parseSaveWorkspaceFileRequest(
  body: unknown,
): ValidationResult<SaveWorkspaceFileRequest> {
  const parsed = saveSchema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return invalidFileRequest(parsed.error.issues);
}

function invalidFileRequest(details: unknown) {
  return {
    ok: false as const,
    error: {
      status: 400,
      code: "invalid_request",
      message: "Choose a valid JSON file in the workspace.",
      details,
    },
  };
}
