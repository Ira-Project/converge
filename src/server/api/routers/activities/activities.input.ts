import { z } from "zod";

export const getActivitiesSchema = z.object({
  classroomId: z.string(),
});
export type GetActivitiesInput = z.infer<typeof getActivitiesSchema>;

export const getActivitySchema = z.object({
  activityId: z.string(),
});
export type GetActivityInput = z.infer<typeof getActivitySchema>;