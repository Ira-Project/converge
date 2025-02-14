import { z } from "zod";

export const evaluateMap = z.object({
  attemptId: z.string(),
  assignmentId: z.string(),
  conceptNodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
  })),
  conceptEdges: z.array(z.object({
    id: z.string(),
    label: z.string(),
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
  })),
});
export type EvaluateMapInput = z.infer<typeof evaluateMap>;

