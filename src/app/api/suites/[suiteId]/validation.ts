import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

const suiteIdSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => value !== "." && value !== ".." && !/[\\/]/.test(value),
    "Suite identifiers cannot contain path separators.",
  );

export function parseSuiteId(
  value: unknown,
):
  | { ok: true; value: { suiteId: string } }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = suiteIdSchema.safeParse(value);
  if (parsed.success) {
    return { ok: true, value: { suiteId: parsed.data } };
  }
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_suite_id",
      message: "Choose a valid suite.",
      details: parsed.error.issues,
    },
  };
}
