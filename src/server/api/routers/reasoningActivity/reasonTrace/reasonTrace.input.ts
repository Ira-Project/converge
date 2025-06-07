import { z } from "zod";

export const getReasoningAssignmentSchema = z.object({
  activityId: z.string(),
});
export type GetReasoningAssignmentInput = z.infer<typeof getReasoningAssignmentSchema>;

export const createReasoningAssignmentAttemptSchema = z.object({
  activityId: z.string().optional(),
  assignmentId: z.string().optional(),
});
export type CreateReasoningAssignmentAttemptInput = z.infer<typeof createReasoningAssignmentAttemptSchema>;

export const submitReasoningAssignmentAttemptSchema = z.object({
  attemptId: z.string(),
  statuses: z.enum(['part1', 'part2', 'part3', 'complete']).array(),
});
export type SubmitReasoningAssignmentAttemptInput = z.infer<typeof submitReasoningAssignmentAttemptSchema>;

export const getReasoningAssignmentAnalyticsSchema = z.object({
  activityId: z.string(),
});
export type GetReasoningAssignmentAnalyticsInput = z.infer<typeof getReasoningAssignmentAnalyticsSchema>;

export const getReasoningAssignmentSubmissionsSchema = z.object({
  activityId: z.string(),
});
export type GetReasoningAssignmentSubmissionsInput = z.infer<typeof getReasoningAssignmentSubmissionsSchema>;

export const getReasoningAssignmentQuestionAnalyticsSchema = z.object({
  activityId: z.string(),
});
export type GetReasoningAssignmentQuestionAnalyticsInput = z.infer<typeof getReasoningAssignmentQuestionAnalyticsSchema>;

export const getReasoningAssignmentByIdSchema = z.object({
  assignmentId: z.string(),
});
export type GetReasoningAssignmentByIdInput = z.infer<typeof getReasoningAssignmentByIdSchema>;