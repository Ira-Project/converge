import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import { reasoningAttemptFinalAnswer, reasoningPathwayAttempts, reasoningPathwayAttemptSteps } from "@/server/db/schema/reasoning/reasoningQuestionAttempts";
import type { Part1EvaluatePathwayInput, part2CorrectPathwayInput, Part3FinalCorrectAnswerInput } from "./reasoning.input";
import { ReasoningPathwayStepResult } from "@/lib/constants";


export const part1EvaluatePathway = async (ctx: ProtectedTRPCContext, input: Part1EvaluatePathwayInput) => {

  // Create the part 1 attempt object
  const id = generateId(21);
  await ctx.db.insert(reasoningPathwayAttempts).values({
    id,
    part: 1,
    attemptId: input.attemptId,
    questionId: input.questionId,
  });

  // Get the correct reasoning pathways for the question
  let reasoningPathways = await ctx.db.query.reasoningPathway.findMany({
    where: (table, { eq }) => eq(table.questionId, input.questionId),
    columns: {
      id: true,
    },
    with : {  
      steps: {
        columns: {
          id: true,
          answerOptionId: true,
          stepNumber: true,
          isCorrect: true,
        }
      }
    }
  });
  
  // Evaluate the pathway
  const results: { optionId: string, result: ReasoningPathwayStepResult }[] = []
  // Check if pathways exist and get the first one's ID
  let pathwayId = reasoningPathways[0]?.id;
  

  for (const [index, optionId] of input.optionIds.entries()) {
    let result = ReasoningPathwayStepResult.WRONG;
    
    // First check if the option exists in the correct position
    for (const pathway of reasoningPathways) {
      const step = pathway.steps.find((step) => step.stepNumber === index + 1);
      if (step?.answerOptionId === optionId) {
        result = ReasoningPathwayStepResult.CORRECT;
        reasoningPathways = reasoningPathways.filter((p) => p.id === pathway.id);
        pathwayId = pathway.id;
        break;
      }
    }

    // If not correct, check if it exists in a different position
    if (result === ReasoningPathwayStepResult.WRONG) {
      for (const pathway of reasoningPathways) {
        const existsInDifferentPosition = pathway.steps.some(
          (step) => step.answerOptionId === optionId && step.stepNumber !== index + 1
        );
        if (existsInDifferentPosition) {
          result = ReasoningPathwayStepResult.WRONG_POSITION;
        }
      }
    }

    await ctx.db.insert(reasoningPathwayAttemptSteps).values({
      id: generateId(21),
      questionAttemptId: id,
      reasoningOptionId: optionId,
      step: index,
      isCorrect: result === ReasoningPathwayStepResult.CORRECT,
    });

    results.push({
      optionId,
      result,
    });
  }

  return {
    pathwayId,
    results,
  };
  
}

// @TODO: Pass in pathway ID in part 2
export const part2CorrectPathway = async (ctx: ProtectedTRPCContext, input: part2CorrectPathwayInput) => {

  const id = generateId(21);
  await ctx.db.insert(reasoningPathwayAttempts).values({
    id,
    part: 2,
    attemptId: input.attemptId,
    questionId: input.questionId,
  });

  // Get the correct reasoning pathways for the question
  const reasoningPathway = await ctx.db.query.reasoningPathway.findFirst({
    where: (table, { eq }) => eq(table.id, input.pathwayId),
    columns: {
      id: true,
    },
    with : {  
      steps: {
        columns: {
          id: true,
          answerOptionId: true,
          stepNumber: true,
          isCorrect: true,
          replacementOptionId: true,
        },
        orderBy: (table, { asc }) => [asc(table.stepNumber)],
      }
    }
  });
  
  // Evaluate the pathway
  const results: { optionId: string, result: ReasoningPathwayStepResult }[] = []
  // Check if pathways exist and get the first one's ID
  
  const incorrectOptions = []

  for (const [index, optionId] of input.optionIds.entries()) {
    let result = ReasoningPathwayStepResult.WRONG;
    
    const step = reasoningPathway?.steps.find((step) => step.stepNumber === index + 1);
    const answerOptionId = step?.isCorrect ? step?.answerOptionId : step?.replacementOptionId;

    // Check if option is in correct position
    if (answerOptionId === optionId) {
      result = ReasoningPathwayStepResult.CORRECT;
      if (!step?.isCorrect) {
        incorrectOptions.push(index);
      }
    } else {
      // Check if option exists in a different position
      const existsInDifferentPosition = reasoningPathway?.steps.some(
        (s) => (s.isCorrect ? s.answerOptionId : s.replacementOptionId) === optionId && s.stepNumber !== index + 1
      );
      if (existsInDifferentPosition) {
        result = ReasoningPathwayStepResult.WRONG_POSITION;
      }
    }

    await ctx.db.insert(reasoningPathwayAttemptSteps).values({
      id: generateId(21),
      questionAttemptId: id,
      reasoningOptionId: optionId,
      step: index,
      isCorrect: result === ReasoningPathwayStepResult.CORRECT,
    });

    results.push({
      optionId,
      result,
    });
  }

  return {
    results,
    incorrectOptions,
  };
}

export const part3FinalCorrectAnswer = async (ctx: ProtectedTRPCContext, input: Part3FinalCorrectAnswerInput) => {
  const question = await ctx.db.query.reasoningQuestions.findFirst({
    where: (table, { eq }) => eq(table.id, input.questionId),
    columns: {
      correctAnswers: true,
    },
  });

  const correctAnswers = question?.correctAnswers.map((answer) => answer.toLocaleLowerCase());
  const correct = correctAnswers?.includes(input.answer.toLocaleLowerCase()) ?? false;

  await ctx.db.insert(reasoningAttemptFinalAnswer).values({
    id: generateId(21),
    attemptId: input.attemptId,
    questionId: input.questionId,
    answer: input.answer,
    isCorrect: correct,
  });
  
  return {
    correct: correct,
  };
}