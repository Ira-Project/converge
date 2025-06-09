import { z } from "zod";

export const getAssignmentsSchema = z.object({
  classroomId: z.string(),
});

export type GetAssignmentsInput = z.infer<typeof getAssignmentsSchema>; 