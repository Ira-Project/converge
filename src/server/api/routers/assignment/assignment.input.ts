import { z } from "zod";

export const listAssignmentsSchema = z.object({
  classroomId: z.string().optional(),
});
export type ListAssignmentsInput = z.infer<typeof listAssignmentsSchema>;

export const createAssignmentSchema = z.object({
  assignmentName: z.string(),
  classId: z.string(),
  dueDate: z.date().min(new Date()),
  maxPoints: z.number().min(0).max(100).optional(),
  timeLimit: z.number().optional(),
  assignmentTemplateId: z.string(),
});
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;