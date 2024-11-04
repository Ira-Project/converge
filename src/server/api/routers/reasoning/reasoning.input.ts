import { z } from "zod";

export const part1EvaluatePathwaySchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  optionIds: z.array(z.string()),
});
export type Part1EvaluatePathwayInput = z.infer<typeof part1EvaluatePathwaySchema>;

export const part2IncorrectOptionsInPathwaySchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  optionIds: z.array(z.string()),
  pathwayId: z.string(),
});
export type Part2IncorrectOptionsInPathwayInput = z.infer<typeof part2IncorrectOptionsInPathwaySchema>;

export const part3FinalCorrectOptionsSchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  optionIds: z.array(z.string()),
  pathwayId: z.string(),
});
export type Part3FinalCorrectOptionsInput = z.infer<typeof part3FinalCorrectOptionsSchema>;
