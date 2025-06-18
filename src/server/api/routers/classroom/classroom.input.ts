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

export const createClassroomSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  gradeText: z.string().optional(),
  courseId: z.string().optional(),
  subjectId: z.string().optional(),
});
export type CreateClassroomInput = z.infer<typeof createClassroomSchema>;

export const updateClassroomSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  showLeaderboardStudents: z.boolean(),
  showLeaderboardTeachers: z.boolean(),
  courseId: z.string().optional(),
  gradeText: z.string().optional(),
  subjectId: z.string().optional(),
});

export type UpdateClassroomInput = z.infer<typeof updateClassroomSchema>;

export const removeStudentSchema = z.object({
  classroomId: z.string(),
  studentId: z.string(),
});

export type RemoveStudentInput = z.infer<typeof removeStudentSchema>;

export const archiveClassroomSchema = z.object({
  id: z.string(),
});

export type ArchiveClassroomInput = z.infer<typeof archiveClassroomSchema>;