import { z } from "zod";

export const updateUserNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export type UpdateUserNameInput = z.infer<typeof updateUserNameSchema>;

export const setDefaultClassroomSchema = z.object({
  classroomId: z.string(),
});

export type SetDefaultClassroomInput = z.infer<typeof setDefaultClassroomSchema>;

export const getUserSettingsSchema = z.object({});

export type GetUserSettingsInput = z.infer<typeof getUserSettingsSchema>; 