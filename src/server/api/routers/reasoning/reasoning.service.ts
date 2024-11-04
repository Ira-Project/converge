import type { ProtectedTRPCContext } from "../../trpc";
import { generateId } from "lucia";
import { part1ReasoningPathwayAttempts, part1ReasoningPathwaySteps, part2IncorrectOptionsAttempts, part3CorrectPathwayAttempts } from "@/server/db/schema/reasoningQuestionAttempts";
import type { Part1EvaluatePathwayInput, Part2IncorrectOptionsInPathwayInput, Part3FinalCorrectOptionsInput } from "./reasoning.input";

export enum PathwayStepResult {
  CORRECT = "correct",
  WRONG = "wrong", 
  WRONG_POSITION = "wrong_position",
  PENDING = "pending"
}

export const part1EvaluatePathway = async (ctx: ProtectedTRPCContext, input: Part1EvaluatePathwayInput) => {

  // Create the part 1 attempt object
  const id = generateId(21);
  await ctx.db.insert(part1ReasoningPathwayAttempts).values({
    id,
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
  const results = []
  // Check if pathways exist and get the first one's ID
  let pathwayId = reasoningPathways[0]?.id;
  let numberOfCorrectSteps = 0;


  for (const [index, optionId] of input.optionIds.entries()) {
    let result = PathwayStepResult.WRONG;
    
    // First check if the option exists in the correct position
    for (const pathway of reasoningPathways) {
      const step = pathway.steps.find((step) => step.stepNumber === index);
      if (step?.answerOptionId === optionId && step?.isCorrect) {
        result = PathwayStepResult.CORRECT;
        reasoningPathways = reasoningPathways.filter((p) => p.id !== pathway.id);
        pathwayId = pathway.id;
        numberOfCorrectSteps++;
        break;
      }
    }

    // If not correct, check if it exists in a different position
    if (result === PathwayStepResult.WRONG) {
      for (const pathway of reasoningPathways) {
        const existsInDifferentPosition = pathway.steps.some(
          (step) => step.answerOptionId === optionId && step.stepNumber !== index && step.isCorrect
        );
        if (existsInDifferentPosition) {
          result = PathwayStepResult.WRONG_POSITION;
          break;
        }
      }
    }

    await ctx.db.insert(part1ReasoningPathwaySteps).values({
      id: generateId(21),
      questionAttemptId: id,
      reasoningOptionId: optionId,
      step: index,
      isCorrect: result === PathwayStepResult.CORRECT,
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

export const part2EvaluateIncorrectOptionsInPathway = async (ctx: ProtectedTRPCContext, input: Part2IncorrectOptionsInPathwayInput) => {

  // Create the part 2 attempt object
  const id = generateId(21);
  await ctx.db.insert(part2IncorrectOptionsAttempts).values({
    id,
    attemptId: input.attemptId,
    questionId: input.questionId,
  });
  
  // Get the reasoning pathway
  const reasoningPathway = await ctx.db.query.reasoningPathway.findFirst({
    where: (table, { eq }) => eq(table.id, input.pathwayId),
    with: {
      steps: {
        columns: {
          id: true,
          answerOptionId: true,
          isCorrect: true,
        }
      }
    }
  });

  // Check if the incorrect options that the student mentioned are the same as the incorrect ones in the pathway
  let missingOptions = 0;
  for (const step of reasoningPathway?.steps ?? []) {
    if(step.isCorrect) continue;
    if(input.optionIds.includes(step?.answerOptionId)) {
      missingOptions++;
      // Remove the option from the array
      input.optionIds = input.optionIds.filter((optionId) => optionId !== step?.answerOptionId);
    }
  }

  const incorrectlyMarked = input.optionIds.length;

  let message = "";
  if (missingOptions) message += `${missingOptions} incorrect option${missingOptions > 1 ? "s" : ""} have not been identified`;
  if (incorrectlyMarked) message += `${incorrectlyMarked} option${incorrectlyMarked > 1 ? "s" : ""} have been incorrectly marked`;
  
  return message;
}

export const part3FinalCorrectPathway = async (ctx: ProtectedTRPCContext, input: Part3FinalCorrectOptionsInput) => {
  // Create the part 3 attempt object
  const id = generateId(21);
  await ctx.db.insert(part3CorrectPathwayAttempts).values({
    id,
    attemptId: input.attemptId,
    questionId: input.questionId,
  });

  // Get the reasoning pathway
  const reasoningPathway = await ctx.db.query.reasoningPathway.findFirst({
    where: (table, { eq }) => eq(table.id, input.pathwayId),
    with: {
      steps: {
        columns: {
          id: true,
          answerOptionId: true,
          isCorrect: true,
          stepNumber: true,
          replacementOptionId: true,
        }
      }
    }
  });

  let numberOfCorrectOptions = 0;
  // Check if the final correct options are the same as the correct ones in the pathway
  for (const [index, optionId] of input.optionIds.entries()) {
    const step = reasoningPathway?.steps.find((step) => step.stepNumber === index);
    if(step?.isCorrect) {
      if(step?.answerOptionId === optionId) {
        numberOfCorrectOptions++;
      } 
    } else {
      if(step?.replacementOptionId === optionId) {
        numberOfCorrectOptions++;
      }
    }
  }

  const message = numberOfCorrectOptions === input.optionIds.length ? "All options are correct" : `${numberOfCorrectOptions} option${numberOfCorrectOptions > 1 ? "s" : ""} are correct`;

  return {
    message,
  };

}