import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

const saveAnnotationSchema = z.object({
  resultId: z.string().min(1),
  caseId: z.string().min(1),
  runId: z.string().min(1),
  updatedAt: z.string().datetime(),
  score: z.number().min(0).max(5),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type SaveAnnotationRequest = z.infer<typeof saveAnnotationSchema>;

export function parseSaveAnnotationRequest(
  body: unknown,
):
  | { ok: true; value: SaveAnnotationRequest }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = saveAnnotationSchema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_request",
      message: "The annotation is invalid.",
      details: parsed.error.issues,
    },
  };
}
