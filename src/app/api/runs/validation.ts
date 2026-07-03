import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

export const createRunRequestSchema = z.object({
  name: z.string().min(1),
  actionId: z.string().min(1),
  caseIds: z.array(z.string()).min(1),
  provider: z.enum(["mock", "openai", "ollama"]),
  model: z.string().min(1),
  temperature: z.number().optional(),
});

export type CreateRunRequest = z.infer<typeof createRunRequestSchema>;

export function parseCreateRunRequest(
  body: unknown,
):
  | { ok: true; value: CreateRunRequest }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = createRunRequestSchema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_request",
      message: "The run request is invalid.",
      details: parsed.error.issues,
    },
  };
}
