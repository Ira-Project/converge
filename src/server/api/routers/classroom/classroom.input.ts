import { z } from "zod";

export const getClassroomSchema = z.object({
  id: z.string(),
});
export type GetClassroomInput = z.infer<typeof getClassroomSchema>;

export const getClassroomTeachersSchema = z.object({
  id: z.string(),
});
export type GetClassroomTeachersInput = z.infer<typeof getClassroomTeachersSchema>;

export const getClassroomStudentsSchema = z.object({
  id: z.string(),
});
export type GetClassroomStudentsInput = z.infer<typeof getClassroomStudentsSchema>;

export const joinClassroomSchema = z.object({
  code: z.string().min(5).max(5),
  name: z.string(),
});
export type JoinClassroomInput = z.infer<typeof joinClassroomSchema>;

export const getOrCreateUserToClassroomSchema = z.object({
  classroomId: z.string(),
});
export type GetOrCreateUserToClassroomInput = z.infer<typeof getOrCreateUserToClassroomSchema>;