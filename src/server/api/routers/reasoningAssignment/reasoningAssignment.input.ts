import { z } from "zod";

export const getReasoningAssignmentSchema = z.object({
  assignmentId: z.string(),
});
export type GetReasoningAssignmentInput = z.infer<typeof getReasoningAssignmentSchema>;

export const makeReasoningAssignmentLiveSchema = z.object({
  assignmentId: z.string(),
  dueDate: z.date().min(new Date()),
  assignmentName: z.string(),
});
export type MakeReasoningAssignmentLiveInput = z.infer<typeof makeReasoningAssignmentLiveSchema>;

export const createReasoningAssignmentAttemptSchema = z.object({
  assignmentId: z.string(),
});
export type CreateReasoningAssignmentAttemptInput = z.infer<typeof createReasoningAssignmentAttemptSchema>;