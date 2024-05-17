import { z } from "zod";

export const listAssignmentsSchema = z.object({
  classroomId: z.string(),
});
export type ListAssignmentsInput = z.infer<typeof listAssignmentsSchema>;