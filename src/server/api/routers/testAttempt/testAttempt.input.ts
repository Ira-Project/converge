import { z } from "zod";

export const createTestAttemptSchema = z.object({
  assignmentId: z.string(),
});
export type CreateTestAttemptInput = z.infer<typeof createTestAttemptSchema>;