import { z } from "zod";

export const createTestAttemptSchema = z.object({
  assignmentId: z.string(),
});
export type CreateTestAttemptInput = z.infer<typeof createTestAttemptSchema>;

export const submitTestAttemptSchema = z.object({
  testAttemptId: z.string(),
});
export type SubmitTestAttemptSchema = z.infer<typeof submitTestAttemptSchema>;