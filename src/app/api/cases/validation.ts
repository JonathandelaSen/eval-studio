import { z } from "zod";

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const createCaseRequestSchema = z.object({
  suiteId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  note: z.string().trim().optional(),
  input: jsonObjectSchema.optional(),
  expectedOutput: jsonObjectSchema.optional(),
  systemInstruction: z.string().trim().optional(),
  userMessage: z.string().trim().min(1),
});
