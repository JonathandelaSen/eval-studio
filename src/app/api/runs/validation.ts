import { z } from "zod";

export const createRunRequestSchema = z.object({
  name: z.string().min(1),
  actionId: z.string().min(1),
  caseIds: z.array(z.string()).min(1),
  provider: z.enum(["mock", "openai", "ollama"]),
  model: z.string().min(1),
  temperature: z.number().optional(),
});

export type CreateRunRequest = z.infer<typeof createRunRequestSchema>;
