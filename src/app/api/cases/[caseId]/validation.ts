import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

const caseIdSchema = z.string().uuid();

const updateCaseSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    note: z.string().trim().min(1).nullable().optional(),
  })
  .refine(
    (value) => value.name !== undefined || value.note !== undefined,
    "Provide a name or note to update.",
  );

export type UpdateCaseRequest = z.infer<typeof updateCaseSchema>;

export function parseCaseId(
  value: unknown,
):
  | { ok: true; value: { caseId: string } }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = caseIdSchema.safeParse(value);
  if (parsed.success) return { ok: true, value: { caseId: parsed.data } };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_case_id",
      message: "Choose a valid case.",
      details: parsed.error.issues,
    },
  };
}

export function parseUpdateCaseRequest(
  body: unknown,
):
  | { ok: true; value: UpdateCaseRequest }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = updateCaseSchema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_request",
      message: "The case update is invalid.",
      details: parsed.error.issues,
    },
  };
}
