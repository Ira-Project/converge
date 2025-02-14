import { z } from "zod";

export const createAttemptSchema = z.object({
  activityId: z.string(),
});
export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;

export const submitAttemptSchema = z.object({
  attemptId: z.string(),
});
export type SubmitAttemptSchema = z.infer<typeof submitAttemptSchema>;

export const getSubmissionsInput = z.object({
  activityId: z.string(),
});
export type GetSubmissionsInput = z.infer<typeof getSubmissionsInput>;

export const getMostCommonMistakesInput = z.object({
  activityId: z.string(),
});
export type GetMostCommonMistakesInput = z.infer<typeof getMostCommonMistakesInput>;

export const getAnalyticsCardsInput = z.object({
  activityId: z.string(),
});
export type GetAnalyticsCardsInput = z.infer<typeof getAnalyticsCardsInput>;

export const getConceptMappingActivityInput = z.object({
  activityId: z.string(),
});
export type GetConceptMappingActivityInput = z.infer<typeof getConceptMappingActivityInput>;
