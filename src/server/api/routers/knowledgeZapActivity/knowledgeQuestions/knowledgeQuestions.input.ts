import { z } from "zod";
import { KnowledgeZapQuestionType } from "@/lib/constants";

export const checkMatchingAnswerInput = z.object({
  assignmentAttemptId: z.string(),
  matchingQuestionId: z.string(),
  questionId: z.string(),
  answer: z.array(z.object({
    optionA: z.string(),
    optionB: z.string(),
  })),
});
export type CheckMatchingAnswerInput = z.infer<typeof checkMatchingAnswerInput>;

export const checkMultipleChoiceAnswerInput = z.object({
  assignmentAttemptId: z.string(),
  multipleChoiceQuestionId: z.string(),
  questionId: z.string(),
  answerOptionId: z.string(),
});
export type CheckMultipleChoiceAnswerInput = z.infer<typeof checkMultipleChoiceAnswerInput>;

export const checkOrderingAnswerInput = z.object({
  assignmentAttemptId: z.string(),
  orderingQuestionId: z.string(),
  questionId: z.string(),
  answer: z.array(z.object({
    option: z.string(),
    id: z.string(),
    order: z.number(),
  })),
});
export type CheckOrderingAnswerInput = z.infer<typeof checkOrderingAnswerInput>;

export const flagQuestionInput = z.object({
  questionId: z.string(),
  type: z.nativeEnum(KnowledgeZapQuestionType),
  report: z.string().optional(),
  questionText: z.string(), // The actual question text for email
  classroomId: z.string(),
});

export type FlagQuestionInput = z.infer<typeof flagQuestionInput>;