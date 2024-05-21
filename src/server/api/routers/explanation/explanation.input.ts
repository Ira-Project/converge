import { z } from "zod";

export const explainTemplateSchema = z.object({
  explanation: z.string(),
  channelName: z.string(),
  assignmentTemplateId: z.string(),
});
export type ExplainInput = z.infer<typeof explainTemplateSchema>;

