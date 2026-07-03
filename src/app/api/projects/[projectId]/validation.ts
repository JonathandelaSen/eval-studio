import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

const projectIdSchema = z.string().regex(
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[0-9a-f]{16})$/i,
);

export function parseProjectId(
  value: unknown,
):
  | { ok: true; value: { projectId: string } }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = projectIdSchema.safeParse(value);
  if (parsed.success) return { ok: true, value: { projectId: parsed.data } };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_project_id",
      message: "Choose a valid project.",
      details: parsed.error.issues,
    },
  };
}
