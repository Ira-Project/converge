import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import type { CheckStepInput } from "./checkStep.input";
import { stepSolveQuestionAttempts, stepSolveQuestionAttemptSteps } from "@/server/db/schema/stepSolve/stepSolveQuestionAttempts";
import { eq } from "drizzle-orm";
import { conceptTracking } from "@/server/db/schema/concept";
import { ActivityType } from "@/lib/constants";


export const checkStep = async (ctx: ProtectedTRPCContext, input: CheckStepInput) => {

  // Get or create the question attempt
  let questionAttemptId = input.questionAttemptId;
  let numberOfPrevStepAttempts = 0;
  let reasoningPrevStepAttempts = 0;
  let evaluationPrevStepAttempts = 0;
  let reasoningPrevCorrect = 0;
  let evaluationPrevCorrect = 0;
  let numberOfPrevCorrect = 0;
  let stepsCompleted = 0;
  if (!questionAttemptId) {
    questionAttemptId = generateId(15);
    await ctx.db.insert(stepSolveQuestionAttempts).values({
      id: questionAttemptId,
      attemptId: input.attemptId,
      questionId: input.questionId,
      correct: false,
      score: 0,
    })
  } else {
    const questionAttempt = await ctx.db.query.stepSolveQuestionAttempts.findFirst({
      where: (questionAttempt, { eq }) => eq(questionAttempt.id, questionAttemptId ?? ""),
      with: {
        stepAttempts: {
          columns: {
            id: true,
            isCorrect: true,
            reasoningCorrect: true,
            evaluationCorrect: true,
          },
          with: {
            step: {
              columns: {
                stepSolveAnswer: true,
              },
              with: {
                opt: {
                  columns: {
                    id: true,
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!questionAttempt) {
      throw new Error("Question attempt not found");
    }
    numberOfPrevStepAttempts = questionAttempt.stepAttempts.length;
    numberOfPrevCorrect = questionAttempt.stepAttempts.filter(stepAttempt => stepAttempt.isCorrect).length;
    reasoningPrevCorrect = questionAttempt.stepAttempts.filter(stepAttempt => stepAttempt.reasoningCorrect).length;
    evaluationPrevCorrect = questionAttempt.stepAttempts.filter(stepAttempt => stepAttempt.evaluationCorrect).length;
    reasoningPrevStepAttempts = questionAttempt.stepAttempts.filter(stepAttempt => stepAttempt.step.opt.length > 0).length;
    evaluationPrevStepAttempts = questionAttempt.stepAttempts.filter(stepAttempt => stepAttempt.step.stepSolveAnswer?.length ?? 0 > 0).length;
    stepsCompleted = questionAttempt.stepsCompleted ?? 0;
  }


  // Get the step and its options
  const step = await ctx.db.query.stepSolveStep.findFirst({
    where: (step, { eq }) => eq(step.id, input.stepId),
    with: {
      opt: true,
      concepts: {
        columns: {
          conceptId: true,
        },
      }
    }
  });

  if (!step) {
    throw new Error("Step not found");
  }

  // Evaluate if the answer provided is correct
  let isCorrect = false;
  let reasoningCorrect = false;
  let evaluationCorrect = false;

  const stepOption = step.opt.find((option) => option.id === input.optionId);
  const stepHasReasoning = step.opt.length > 0 && stepOption;

  const stepHasEvaluation = (step.stepSolveAnswer?.length ?? 0) > 0;

  
  if(!stepHasReasoning) {
    evaluationCorrect = step.stepSolveAnswer?.includes(input.answer?.trim().toLowerCase() ?? "") ?? false;
    for(const answer of step.stepSolveAnswer ?? []) {
      console.log(answer, input.answer);
      try {
        const answerNumber = parseFloat(input.answer ?? "");
        const stepSolveAnswerNumber = parseFloat(answer ?? "");
        isCorrect = Math.abs(answerNumber - stepSolveAnswerNumber) < 0.01;
        if(isCorrect) {
        evaluationCorrect = true;
          break;
        }
      } catch (error) {
        console.log(error);
      }
    };
    reasoningCorrect = true;
  } else if (!stepHasEvaluation) {
    reasoningCorrect = stepOption.isCorrect;
    evaluationCorrect = true;
  } else {
    reasoningCorrect = stepOption.isCorrect;
    evaluationCorrect = step.stepSolveAnswer?.includes(input.answer?.toLowerCase() ?? "") ?? false;
    //Also check if answer is correct numerically
    for(const answer of step.stepSolveAnswer ?? []) {
      const answerNumber = parseFloat(input.answer ?? "");
      const stepSolveAnswerNumber = parseFloat(answer ?? "");
      const calculation = Math.abs(answerNumber - stepSolveAnswerNumber) < 0.01;
      if(calculation) {
        evaluationCorrect = true;
        break;
      }
    }
  }

  isCorrect = reasoningCorrect && evaluationCorrect;
  
  // Create the step attempt object
  await ctx.db.insert(stepSolveQuestionAttemptSteps).values({
    id: generateId(15),
    questionAttemptId: questionAttemptId,
    stepSolveStepId: input.stepId,
    stepSolveStepOptionId: input.optionId,
    reasoningCorrect: stepHasReasoning ? reasoningCorrect : undefined,
    evaluationCorrect: stepHasEvaluation ? evaluationCorrect : undefined,
    isCorrect: isCorrect,
    answer: input.answer,
  });

  let reasoningCorrectScore = 0;
  let evaluationCorrectScore = 0;
  if(stepHasReasoning) {
    reasoningCorrectScore = reasoningCorrect ? 
        (reasoningPrevCorrect + 1) / (reasoningPrevStepAttempts + 1) 
      : reasoningPrevCorrect / (reasoningPrevStepAttempts + 1);
  }
  if(stepHasEvaluation) {
    evaluationCorrectScore = evaluationCorrect ? 
        (evaluationPrevCorrect + 1) / (evaluationPrevStepAttempts + 1) 
      : evaluationPrevCorrect / (evaluationPrevStepAttempts + 1);
  }
  
  //Update the question attempt
  await ctx.db.update(stepSolveQuestionAttempts).set({
    correct: isCorrect,
    score: (isCorrect ? numberOfPrevCorrect + 1 : numberOfPrevCorrect + 0) / (numberOfPrevStepAttempts + 1),
    reasoningScore: stepHasReasoning ? reasoningCorrectScore : undefined,
    evaluationScore: stepHasEvaluation ? evaluationCorrectScore : undefined,
    stepsCompleted: isCorrect ? stepsCompleted + 1 : stepsCompleted,
  }).where(eq(stepSolveQuestionAttempts.id, questionAttemptId));

  const stepSolveAssignmentAttempt = await ctx.db.query.stepSolveAssignmentAttempts.findFirst({
    where: (attempt, { eq }) => eq(attempt.id, input.attemptId),
    with: {
      activity: {
        columns: { id: true },
        with: {
          classroom: {
            columns: { id: true },
          },
        },
      },
    }
  });

  for (const concept of step.concepts) {
    await ctx.db.insert(conceptTracking).values({
      id: generateId(15),
      conceptId: concept.conceptId ?? "",
      userId: ctx.user.id,
      activityType: ActivityType.StepSolve,
      classroomId: stepSolveAssignmentAttempt?.activity?.classroom?.id ?? "",
      isCorrect: isCorrect,
    });
  }
  
  return {
    isCorrect,
    questionAttemptId,
  };
}