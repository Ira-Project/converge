import { z } from "zod";

export const createAttemptSchema = z.object({
  activityId: z.string().optional(),
  assignmentId: z.string().optional(),
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

export const getStudentHighlightsInput = z.object({
  activityId: z.string(),
});
export type GetStudentHighlightsInput = z.infer<typeof getStudentHighlightsInput>;

export const getAnalyticsCardsInput = z.object({
  activityId: z.string(),
});
export type GetAnalyticsCardsInput = z.infer<typeof getAnalyticsCardsInput>;

export const getReadAndRelayActivityInput = z.object({
  activityId: z.string(),
});
export type GetReadAndRelayActivityInput = z.infer<typeof getReadAndRelayActivityInput>;

export const getReadAndRelayAssignmentByIdInput = z.object({
  assignmentId: z.string(),
});
export type GetReadAndRelayAssignmentByIdInput = z.infer<typeof getReadAndRelayAssignmentByIdInput>;
