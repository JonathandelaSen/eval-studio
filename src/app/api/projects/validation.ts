import { z } from "zod";
import type { ApiErrorDescriptor } from "@/app/api/_shared/api-responses";

const createProjectSchema = z.object({
  directory: z.string().trim().min(1),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

export function parseCreateProjectRequest(
  body: unknown,
):
  | { ok: true; value: CreateProjectRequest }
  | { ok: false; error: ApiErrorDescriptor } {
  const parsed = createProjectSchema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    error: {
      status: 400,
      code: "invalid_request",
      message: "Choose a project directory.",
      details: parsed.error.issues,
    },
  };
}
