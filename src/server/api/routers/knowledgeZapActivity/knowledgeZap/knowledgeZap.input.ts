import { z } from "zod";

export const createAssignmentAttemptSchema = z.object({
  activityId: z.string().optional(),
  assignmentId: z.string().optional(),
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

export const getKnowledgeZapAssignmentInput = z.object({
  assignmentId: z.string(),
});
export type GetKnowledgeZapAssignmentInput = z.infer<typeof getKnowledgeZapAssignmentInput>;

export const getKnowledgeZapRevisionActivityInput = z.object({
  classroomId: z.string(),
});
export type GetKnowledgeZapRevisionActivityInput = z.infer<typeof getKnowledgeZapRevisionActivityInput>;

export const getAssignmentConceptsInput = z.object({
  activityId: z.string(),
});
export type GetAssignmentConceptsInput = z.infer<typeof getAssignmentConceptsInput>;

export const getAssignmentConceptsByIdInput = z.object({
  assignmentId: z.string(),
});
export type GetAssignmentConceptsByIdInput = z.infer<typeof getAssignmentConceptsByIdInput>;


