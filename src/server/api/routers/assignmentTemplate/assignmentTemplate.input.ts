import { z } from "zod";

export const getAssignmentTemplateSchema = z.object({
  id: z.string(),
});
export type GetAssignmentTemplateInput = z.infer<typeof getAssignmentTemplateSchema>;