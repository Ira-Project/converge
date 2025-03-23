import { z } from "zod";

export const getTopicsSchema = z.object({
  classroomId: z.string(),
});
export type GetTopicsInput = z.infer<typeof getTopicsSchema>;

export const getSubmissionsSchema = z.object({
  classroomId: z.string(),
});
export type GetSubmissionsInput = z.infer<typeof getSubmissionsSchema>;

export const topicBreakdownSchema = z.object({
  classroomId: z.string(),
});
export type TopicBreakdownInput = z.infer<typeof topicBreakdownSchema>;