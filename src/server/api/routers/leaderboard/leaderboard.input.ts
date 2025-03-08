import { z } from "zod";

export const getLeaderboardSchema = z.object({
  classroomId: z.string(),
});
export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>;