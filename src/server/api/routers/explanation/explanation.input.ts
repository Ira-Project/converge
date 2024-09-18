import { z } from "zod";

export const explainSchema = z.object({
  explanation: z.string().min(10, "Explanation must be at least 10 characters long"),
  formula: z.array(z.string()),
  channelName: z.string(),
  testAttemptId: z.string().optional(),
  assignmentId: z.string(),
});
export type ExplainInput = z.infer<typeof explainSchema>;

