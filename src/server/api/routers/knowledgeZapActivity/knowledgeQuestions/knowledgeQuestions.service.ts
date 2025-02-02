import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import type { CheckMatchingAnswerInput, CheckMultipleChoiceAnswerInput, CheckOrderingAnswerInput } from "./knowledgeQuestions.input";
import { eq } from "drizzle-orm";
import { knowledgeZapQuestionAttempts } from "@/server/db/schema/knowledgeZap/knowledgeZapQuestions";
import { matchingAttempt, matchingAttemptSelection, matchingQuestions } from "@/server/db/schema/knowledgeZap/matchingQuestions";
import { multipleChoiceAttempt, multipleChoiceQuestions } from "@/server/db/schema/knowledgeZap/multipleChoiceQuestions";
import { orderingAttempt, orderingAttemptSelection, orderingQuestions } from "@/server/db/schema/knowledgeZap/orderingQuestions";

export const checkMatchingAnswer = async (ctx: ProtectedTRPCContext, input: CheckMatchingAnswerInput) => {
  const { assignmentAttemptId, matchingQuestionId, questionId, answer } = input;

  const matchingQuestion = await ctx.db.query.matchingQuestions.findFirst({
    where: eq(matchingQuestions.id, matchingQuestionId),
    with: {
      options: true,
    }
  });

  const matchingQuestionOptions = matchingQuestion?.options.map((option) => ({
    id: option.id,
    optionA: option.optionA,
    optionB: option.optionB,
  }));

  const correct = matchingQuestionOptions?.every((correctPair) => 
    answer.some((answerPair) => 
      answerPair.optionA === correctPair.optionA && 
      answerPair.optionB === correctPair.optionB
    )
  );

  const questionAttemptId = generateId(21);
  await ctx.db.insert(knowledgeZapQuestionAttempts).values({
    id: questionAttemptId,
    attemptId: assignmentAttemptId,
    questionId,
    isCorrect: correct ?? false,
  });

  const matchingAttemptId = generateId(21);
  await ctx.db.insert(matchingAttempt).values({
    id: matchingAttemptId, 
    questionAttemptId: questionAttemptId,
    questionId: matchingQuestionId,
    isCorrect: correct ?? false,
  });

  for (const answerPair of answer) {
    const option1Id = matchingQuestionOptions?.find((option) => option.optionA === answerPair.optionA)?.id;
    const option2Id = matchingQuestionOptions?.find((option) => option.optionB === answerPair.optionB)?.id;
    if (!option1Id || !option2Id) continue;
    
    await ctx.db.insert(matchingAttemptSelection).values({
      id: generateId(21),
      attemptId: matchingAttemptId,
      option1Id: option1Id,
      option2Id: option2Id,
    });
  }

  return {
    correct: correct ?? false,
  };

};

export const checkMultipleChoiceAnswer = async (ctx: ProtectedTRPCContext, input: CheckMultipleChoiceAnswerInput) => {
  const { assignmentAttemptId, multipleChoiceQuestionId, questionId, answerOptionId } = input;

  const multipleChoiceQuestion = await ctx.db.query.multipleChoiceQuestions.findFirst({
    where: eq(multipleChoiceQuestions.id, multipleChoiceQuestionId),
    with: {
      options: true,
    }
  });

  const correctOptionId = multipleChoiceQuestion?.options.find((option) => option.isCorrect)?.id;
  const correct = correctOptionId === answerOptionId;

  const questionAttemptId = generateId(21);
  await ctx.db.insert(knowledgeZapQuestionAttempts).values({
    id: questionAttemptId,
    attemptId: assignmentAttemptId,
    questionId,
    isCorrect: correct ?? false,
  });

  await ctx.db.insert(multipleChoiceAttempt).values({
    id: generateId(21),
    questionAttemptId: questionAttemptId,
    questionId: multipleChoiceQuestionId,
    optionId: answerOptionId,
    isCorrect: correct ?? false,
  });

  return {
    correct: correct ?? false,
  };

};

export const checkOrderingAnswer = async (ctx: ProtectedTRPCContext, input: CheckOrderingAnswerInput) => {
  const { assignmentAttemptId, orderingQuestionId, questionId, answer } = input;

  const orderingQuestion = await ctx.db.query.orderingQuestions.findFirst({
    where: eq(orderingQuestions.id, orderingQuestionId),
    with: {
      options: true,
    }
  });

  let correct = true;
  
  for (const userAnswer of input.answer) {
    const correctOption = orderingQuestion?.options.find(o => o.option === userAnswer?.option);

    if (userAnswer.order !== correctOption?.order) {
      correct = false;
    }
  }

  const questionAttemptId = generateId(21);
  await ctx.db.insert(knowledgeZapQuestionAttempts).values({
    id: questionAttemptId,
    attemptId: assignmentAttemptId,
    questionId,
    isCorrect: correct ?? false,
  });

  const orderingAttemptId = generateId(21);
  await ctx.db.insert(orderingAttempt).values({
    id: orderingAttemptId,
    questionAttemptId: questionAttemptId,
    questionId: orderingQuestionId,
    isCorrect: correct ?? false,
  });

  for (const option of answer) {

    const optionOrder = orderingQuestion?.options.find((o) => o.option === option.option)?.order;
    const optionCorrect = optionOrder === option.order;

    await ctx.db.insert(orderingAttemptSelection).values({
      id: generateId(21),
      attemptId: orderingAttemptId,
      optionId: option.id,
      order: option.order,
      isCorrect: optionCorrect,
    });
  }

  return {
    correct: correct ?? false,
  };

};

