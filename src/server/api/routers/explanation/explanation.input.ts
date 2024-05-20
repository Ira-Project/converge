import { z } from "zod";

export const explainSchema = z.object({
  explanation: z.string(),
  channelName: z.string(),
});
export type ExplainInput = z.infer<typeof explainSchema>;

