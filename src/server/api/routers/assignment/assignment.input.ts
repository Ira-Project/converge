import { z } from "zod";

export const listAssignmentsSchema = z.object({
  classroomId: z.string().optional(),
});
export type ListAssignmentsInput = z.infer<typeof listAssignmentsSchema>;

export const getAssignmentSchema = z.object({
  assignmentId: z.string(),
});
export type GetAssignmentInput = z.infer<typeof getAssignmentSchema>;