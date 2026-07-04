import { z } from "zod";

export const createCaseRequestSchema = z.object({
  suiteId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  note: z.string().trim().optional(),
  expectedOutput: z.string().trim().min(1).optional(),
  systemInstruction: z.string().trim().optional(),
  userMessage: z.string().trim().min(1),
});
