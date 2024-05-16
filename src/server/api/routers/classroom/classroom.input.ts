import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(255),
  subject: z.string(),
});
export type CreateClassroomInput = z.infer<typeof createClassroomSchema>;