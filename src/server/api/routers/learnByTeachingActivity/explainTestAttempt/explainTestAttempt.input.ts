import { z } from "zod";

export const createTestAttemptSchema = z.object({
  activityId: z.string(),
});
export type CreateTestAttemptInput = z.infer<typeof createTestAttemptSchema>;

export const submitTestAttemptSchema = z.object({
  testAttemptId: z.string(),
});
export type SubmitTestAttemptSchema = z.infer<typeof submitTestAttemptSchema>;

export const getSubmissionsInput = z.object({
  activityId: z.string(),
});
export type GetSubmissionsInput = z.infer<typeof getSubmissionsInput>;

export const getUnderstandingGapsInput = z.object({
  activityId: z.string(),
});
export type GetUnderstandingGapsInput = z.infer<typeof getUnderstandingGapsInput>;

export const getAnalyticsCardsInput = z.object({
  activityId: z.string(),
});
export type GetAnalyticsCardsInput = z.infer<typeof getAnalyticsCardsInput>;