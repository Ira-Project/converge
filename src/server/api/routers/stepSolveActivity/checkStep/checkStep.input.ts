import { z } from "zod";

export const checkStepSchema = z.object({
  stepId: z.string(),
  questionId: z.string(),
  questionAttemptId: z.string().optional(),
  answer: z.string().optional(),
  optionId: z.string().optional(),
  attemptId: z.string(),
});
export type CheckStepInput = z.infer<typeof checkStepSchema>;