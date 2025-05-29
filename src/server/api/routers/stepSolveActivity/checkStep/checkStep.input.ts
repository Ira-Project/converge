import { z } from "zod";

export const checkStepSchema = z.object({
  stepId: z.string(),
  questionId: z.string(),
  questionAttemptId: z.string().optional(),
  answer: z.string().optional(),
  optionId: z.string().optional(),
  attemptId: z.string(),
  classroomId: z.string().optional(),
});
export type CheckStepInput = z.infer<typeof checkStepSchema>;

export const flagStepInput = z.object({
  stepId: z.string(),
  report: z.string().optional(),
  stepText: z.string(), // The actual step text for email
  classroomId: z.string(),
});
export type FlagStepInput = z.infer<typeof flagStepInput>;