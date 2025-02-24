import { z } from "zod";

export const createAssignmentAttemptSchema = z.object({
  activityId: z.string(),
});
export type CreateAssignmentAttemptInput = z.infer<typeof createAssignmentAttemptSchema>;

export const submitAssignmentAttemptSchema = z.object({
  assignmentAttemptId: z.string(),
  assignmentId: z.string(),
});
export type SubmitAssignmentAttemptSchema = z.infer<typeof submitAssignmentAttemptSchema>;

export const getSubmissionsInput = z.object({
  activityId: z.string(),
});
export type GetSubmissionsInput = z.infer<typeof getSubmissionsInput>;

export const getAnalyticsCardsInput = z.object({
  activityId: z.string(),
});
export type GetAnalyticsCardsInput = z.infer<typeof getAnalyticsCardsInput>;

export const getHeatMapInput = z.object({
  activityId: z.string(),
});
export type GetHeatMapInput = z.infer<typeof getHeatMapInput>;

export const getKnowledgeZapActivityInput = z.object({
  activityId: z.string(),
});
export type GetKnowledgeZapActivityInput = z.infer<typeof getKnowledgeZapActivityInput>;


