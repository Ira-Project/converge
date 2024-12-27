import { z } from "zod";

export const getAssignmentSchema = z.object({
  activityId: z.string(),
});
export type GetAssignmentInput = z.infer<typeof getAssignmentSchema>;

export const makeActivityLiveSchema = z.object({
  activityId: z.string(),
  dueDate: z.date().min(new Date()),
});
export type MakeActivityLiveInput = z.infer<typeof makeActivityLiveSchema>;