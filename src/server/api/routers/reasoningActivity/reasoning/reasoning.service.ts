import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import { reasoningAttemptFinalAnswer, reasoningPathwayAttempts, reasoningPathwayAttemptSteps } from "@/server/db/schema/reasoning/reasoningQuestionAttempts";
import type { Part1IdentifyCorrectPathwayInput, Part2ComputeCorrectAnswerInput, Part3ErrorAnalysisInput } from "./reasoning.input";
import { ReasoningPathwayStepResult } from "@/lib/constants";
import { eq } from "drizzle-orm";

export const part1IdentifyCorrectPathway = async (ctx: ProtectedTRPCContext, input: Part1IdentifyCorrectPathwayInput) => {

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
          stepNumberList: true,
          isCorrect: true,
          replacementOptionId: true,
        }
      }
    }
  });
  
  // Evaluate the pathway
  const results: { optionId: string, result: ReasoningPathwayStepResult }[] = []
  // Check if pathways exist and get the first one's ID
  let pathwayId = reasoningPathways[0]?.id;

  let overallCorrect = true;

  for (const [index, optionId] of input.optionIds.entries()) {
    
    let result = ReasoningPathwayStepResult.WRONG;
    
    // First check if the option exists in any of the correct positions
    for (const pathway of reasoningPathways) {
      const matchingStep = pathway.steps.find(step => {
        // Check both the correct answer option and replacement option
        const correctOptionId = step.isCorrect ? step.answerOptionId : step.replacementOptionId;
        return correctOptionId === optionId;
      });
      
      if (matchingStep) {
        // If the step exists, check if it's in the correct position
        if(matchingStep.stepNumberList?.includes(index + 1)) {
          result = ReasoningPathwayStepResult.CORRECT;
          reasoningPathways = reasoningPathways.filter((p) => p.id === pathway.id);
          pathwayId = pathway.id;
        } else if (matchingStep.stepNumber === index + 1) {
          result = ReasoningPathwayStepResult.CORRECT;
          reasoningPathways = reasoningPathways.filter((p) => p.id === pathway.id);
          pathwayId = pathway.id;
        } else {
          result = ReasoningPathwayStepResult.WRONG_POSITION;
        }
      }
    }

    if (result !== ReasoningPathwayStepResult.CORRECT) {
      overallCorrect = false;
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

  // Update the part 1 attempt object if correct
  if (overallCorrect) {
    await ctx.db.update(reasoningPathwayAttempts).set({
      correct: true,
    }).where(eq(reasoningPathwayAttempts.id, id));
  }

  return {
    pathwayId,
    results,
    overallCorrect,
  };
  
}

export const part2ComputeCorrectAnswer = async (ctx: ProtectedTRPCContext, input: Part2ComputeCorrectAnswerInput) => {
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

export const part3ErrorAnalysis = async (ctx: ProtectedTRPCContext, input: Part3ErrorAnalysisInput) => {

  const id = generateId(21);
  await ctx.db.insert(reasoningPathwayAttempts).values({
    id,
    part: 3,
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
  
  // Evaluate the incorrect pathway provided by the user to show what would lead to errors
  const results: { optionId: string, result: ReasoningPathwayStepResult }[] = []
  const incorrectStepIndices: number[] = []

  let overallCorrect = true;

  for (const [index, optionId] of input.incorrectOptionIds.entries()) {
    let result = ReasoningPathwayStepResult.WRONG;
    
    const correctStep = reasoningPathway?.steps.find((step) => step.stepNumber === index + 1);
    const correctOptionId = correctStep?.answerOptionId;

    // Check if this step matches the correct pathway
    if (correctOptionId === optionId) {
      result = ReasoningPathwayStepResult.CORRECT;
    } else {
      // Check if option exists in a different position (wrong position)
      const existsInDifferentPosition = reasoningPathway?.steps.some(
        (s) => (s.answerOptionId) === optionId && s.stepNumber !== index + 1
      );
      if (existsInDifferentPosition) {
        result = ReasoningPathwayStepResult.WRONG_POSITION;
      } else {
        result = ReasoningPathwayStepResult.WRONG;
      }
      incorrectStepIndices.push(index);
      overallCorrect = false;
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

  // Update the part 3 attempt object if they correctly identified errors
  if (overallCorrect) {
    await ctx.db.update(reasoningPathwayAttempts).set({
      correct: true,
    }).where(eq(reasoningPathwayAttempts.id, id));
  }

  return {
    results,
    incorrectStepIndices,
    overallCorrect,
  };
}

// Legacy functions for backward compatibility (if needed)
export const part1EvaluatePathway = part1IdentifyCorrectPathway;

export const part2CorrectPathway = async (ctx: ProtectedTRPCContext, input: { attemptId: string; questionId: string; originalOptionIds: string[]; optionIds: string[]; pathwayId: string; }) => {
  // Map the old part2CorrectPathway to the new part3ErrorAnalysis
  return await part3ErrorAnalysis(ctx, {
    attemptId: input.attemptId,
    questionId: input.questionId,
    pathwayId: input.pathwayId,
    incorrectOptionIds: input.optionIds, // The "corrected" options are actually the incorrect ones to analyze
  });
};

export const part3FinalCorrectAnswer = part2ComputeCorrectAnswer;