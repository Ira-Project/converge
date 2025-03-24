import { z } from "zod";

export const getSubmissionsSchema = z.object({
  classroomId: z.string(),
});
export type GetSubmissionsInput = z.infer<typeof getSubmissionsSchema>;

export const getConceptTrackingSchema = z.object({
  classroomId: z.string(),
});
export type GetConceptTrackingInput = z.infer<typeof getConceptTrackingSchema>;
