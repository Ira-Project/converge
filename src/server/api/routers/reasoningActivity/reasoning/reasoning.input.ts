import { z } from "zod";

export const part1EvaluatePathwaySchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  optionIds: z.array(z.string()),
});
export type Part1EvaluatePathwayInput = z.infer<typeof part1EvaluatePathwaySchema>;

export const part2CorrectPathwaySchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  originalOptionIds: z.array(z.string()),
  optionIds: z.array(z.string()),
  pathwayId: z.string(),
});
export type part2CorrectPathwayInput = z.infer<typeof part2CorrectPathwaySchema>;

export const part3FinalCorrectAnswerSchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  answer: z.string(),
});
export type Part3FinalCorrectAnswerInput = z.infer<typeof part3FinalCorrectAnswerSchema>;
