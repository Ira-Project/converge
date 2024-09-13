import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  courses: z.array(z.string()),
  subjects: z.array(z.string()),
});
export type updateUserInput = z.infer<typeof updateUserSchema>;