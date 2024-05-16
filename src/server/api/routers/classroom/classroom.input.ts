import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(255),
  subject: z.string(),
});
export type CreateClassroomInput = z.infer<typeof createClassroomSchema>;

export const joinClassroomSchema = z.object({
  code: z.string().min(5).max(5),
  name: z.string(),
});
export type JoinClassroomInput = z.infer<typeof joinClassroomSchema>;