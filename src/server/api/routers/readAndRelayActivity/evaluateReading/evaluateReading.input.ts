import { z } from "zod";

export const evaluateReadingSchema = z.object({
  highlights: z.array(z.string()).min(1, "Must select at least one highlight"),
  formulas: z.array(z.string()),
  channelName: z.string(),
  attemptId: z.string().optional(),
  assignmentId: z.string(),
});
export type EvaluateReadingInput = z.infer<typeof evaluateReadingSchema>;

