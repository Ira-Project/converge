import { z } from "zod";

// NEW PART 1: Identify the correct pathway
export const part1IdentifyCorrectPathwaySchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  optionIds: z.array(z.string()),
});
export type Part1IdentifyCorrectPathwayInput = z.infer<typeof part1IdentifyCorrectPathwaySchema>;

// NEW PART 2: Compute the correct answer  
export const part2ComputeCorrectAnswerSchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  answer: z.string(),
});
export type Part2ComputeCorrectAnswerInput = z.infer<typeof part2ComputeCorrectAnswerSchema>;

// NEW PART 3: Error analysis to identify incorrect pathway
export const part3ErrorAnalysisSchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  pathwayId: z.string(),
  incorrectOptionIds: z.array(z.string()),
});
export type Part3ErrorAnalysisInput = z.infer<typeof part3ErrorAnalysisSchema>;

// Legacy schemas for backward compatibility (if needed)
export const part1EvaluatePathwaySchema = part1IdentifyCorrectPathwaySchema;
export type Part1EvaluatePathwayInput = Part1IdentifyCorrectPathwayInput;

export const part2CorrectPathwaySchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  originalOptionIds: z.array(z.string()),
  optionIds: z.array(z.string()),
  pathwayId: z.string(),
});
export type part2CorrectPathwayInput = z.infer<typeof part2CorrectPathwaySchema>;

export const part3FinalCorrectAnswerSchema = part2ComputeCorrectAnswerSchema;
export type Part3FinalCorrectAnswerInput = Part2ComputeCorrectAnswerInput;
