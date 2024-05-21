import { z } from "zod";

export const explainSchema = z.object({
  explanation: z.string(),
  channelName: z.string(),
  assignmentTemplateId: z.string(),
  testAttemptId: z.string().optional(),
});
export type ExplainInput = z.infer<typeof explainSchema>;

