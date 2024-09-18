import { z } from "zod";

export const listAssignmentsSchema = z.object({
  classroomId: z.string().optional(),
});
export type ListAssignmentsInput = z.infer<typeof listAssignmentsSchema>;

export const getAssignmentSchema = z.object({
  assignmentId: z.string(),
});
export type GetAssignmentInput = z.infer<typeof getAssignmentSchema>;

export const makeAssignmentLiveSchema = z.object({
  assignmentId: z.string(),
  dueDate: z.date().min(new Date()),
  assignmentName: z.string(),
});
export type MakeAssignmentLiveInput = z.infer<typeof makeAssignmentLiveSchema>;