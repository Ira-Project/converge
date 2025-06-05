import { z } from "zod";

export const getStepSolveAssignmentSchema = z.object({
  activityId: z.string(),
});
export type GetStepSolveAssignmentInput = z.infer<typeof getStepSolveAssignmentSchema>;

export const createStepSolveAssignmentAttemptSchema = z.object({
  assignmentId: z.string().optional(),
  activityId: z.string().optional(),
});
export type CreateStepSolveAssignmentAttemptInput = z.infer<typeof createStepSolveAssignmentAttemptSchema>;

export const submitStepSolveAssignmentAttemptSchema = z.object({
  attemptId: z.string(),
  activityId: z.string(),
  assignmentId: z.string(),
});
export type SubmitStepSolveAssignmentAttemptInput = z.infer<typeof submitStepSolveAssignmentAttemptSchema>;

export const getStepSolveAssignmentAnalyticsSchema = z.object({
  activityId: z.string(),
});
export type GetStepSolveAssignmentAnalyticsInput = z.infer<typeof getStepSolveAssignmentAnalyticsSchema>;

export const getStepSolveAssignmentSubmissionsSchema = z.object({
  activityId: z.string(),
});
export type GetStepSolveAssignmentSubmissionsInput = z.infer<typeof getStepSolveAssignmentSubmissionsSchema>;

export const getStepSolveAssignmentQuestionAnalyticsSchema = z.object({
  activityId: z.string(),
});
export type GetStepSolveAssignmentQuestionAnalyticsInput = z.infer<typeof getStepSolveAssignmentQuestionAnalyticsSchema>;

export const getStepSolveHeatmapSchema = z.object({
  activityId: z.string(),
});
export type GetStepSolveHeatmapInput = z.infer<typeof getStepSolveHeatmapSchema>;

export const getStepSolveRevisionActivitySchema = z.object({
  classroomId: z.string(),
});
export type GetStepSolveRevisionActivityInput = z.infer<typeof getStepSolveRevisionActivitySchema>;

export const getStepSolveAssignmentConceptsSchema = z.object({
  activityId: z.string(),
});
export type GetStepSolveAssignmentConceptsInput = z.infer<typeof getStepSolveAssignmentConceptsSchema>;
