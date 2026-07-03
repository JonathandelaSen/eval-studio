import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

const runIdSchema = z
  .string()
  .min(1)
  .regex(/^(?!\.+$)[A-Za-z0-9._:-]+$/);

const updateRunSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    notes: z.string().trim().min(1).nullable().optional(),
  })
  .refine(
    (value) => value.name !== undefined || value.notes !== undefined,
    "Provide a name or notes to update.",
  );

export type UpdateRunRequest = z.infer<typeof updateRunSchema>;

export function parseRunId(
  value: unknown,
):
  | { ok: true; value: { runId: string } }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = runIdSchema.safeParse(value);
  if (parsed.success) return { ok: true, value: { runId: parsed.data } };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_run_id",
      message: "Choose a valid run.",
      details: parsed.error.issues,
    },
  };
}

export function parseUpdateRunRequest(
  body: unknown,
):
  | { ok: true; value: UpdateRunRequest }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = updateRunSchema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_request",
      message: "The run update is invalid.",
      details: parsed.error.issues,
    },
  };
}
