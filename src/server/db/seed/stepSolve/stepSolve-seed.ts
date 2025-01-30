/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";

import stepSolve from "./thermodynamics.json";
import { stepSolveQuestions, stepSolveQuestionToAssignment, stepSolveStep, stepSolveStepOptions } from "../../schema/stepSolve/stepSolveQuestions";
import { stepSolveAssignments } from "../../schema/stepSolve/stepSolveAssignment";


export async function createStepSolveAssignment() {
  const topicId = process.env.ENVIRONMENT === "prod" ? stepSolve.topicIdProd : stepSolve.topicIdDev;
  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId),
  )

  if(topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }

  const existingAssignment = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.topicId, topicId));

  let stepSolveAssignment;

  if (existingAssignment.length > 0) {
    console.log("Step Solve assignment already exists");
    stepSolveAssignment = existingAssignment[0];
  } else {
    const ssa = await db.insert(stepSolveAssignments).values({
      id: generateId(21),
      name: stepSolve.name,
      description: "Step Solve",
      topicId: topicId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({
      id: stepSolveAssignments.id,
    });
    stepSolveAssignment = ssa[0];
  } 

  if(!stepSolveAssignment?.id) {
    throw new Error("Failed to create step solve assignment");
  }


  for (const stepSolveQuestion of stepSolve.questions) {
    // Check if question already exists
    const existingQuestion = await db.select().from(stepSolveQuestions).where(
      and(
        eq(stepSolveQuestions.questionText, stepSolveQuestion.questionText),
        eq(stepSolveQuestions.topicId, topicId)
      )
    )

    let questionId: string;
    if (existingQuestion?.[0]?.id !== undefined) {
      console.log(`Question "${stepSolveQuestion.questionText.substring(0, 30)}..." already exists`)
      questionId = existingQuestion[0].id;
    } else {
      // Create the reasoning question
      questionId = generateId(21)
      await db.insert(stepSolveQuestions).values({
        id: questionId,
        questionText: stepSolveQuestion.questionText,
        questionImage: stepSolveQuestion.questionImage,
        topicId: topicId,
      })
    }

    // Check and create steps
    for (const [index, step] of stepSolveQuestion.steps.entries()) {
      const existingStep = await db.select().from(stepSolveStep).where(
        and(
          eq(stepSolveStep.questionId, questionId),
          eq(stepSolveStep.id, step.id)
        )
      )

      if (existingStep?.[0]?.id === undefined) {
        await db.insert(stepSolveStep).values({
          id: step.id,
          questionId: questionId,
          stepText: step.stepText,
          stepTextPart2: step?.stepText2 ?? undefined,
          stepImage: step.stepImage,
          stepNumber: index + 1,
          stepSolveAnswer: step.stepSolveAnswer ?? undefined,
        })
      }

      // Check and create options
      for (const option of step.options) {
        const existingOption = await db.select().from(stepSolveStepOptions).where(
          and(
            eq(stepSolveStepOptions.stepId, step.id),
            eq(stepSolveStepOptions.optionText, option.optionText)
          )
        )

        if (existingOption?.[0]?.id === undefined) {
          await db.insert(stepSolveStepOptions).values({
            id: generateId(21),
            stepId: step.id,
            optionText: option.optionText,
            optionImage: option.optionImage,
            isCorrect: option.isCorrect,
          })
        }
      }
    }

    await db.insert(stepSolveQuestionToAssignment).values({
      id: generateId(21),
      assignmentId: stepSolveAssignment.id,
      questionId: questionId,
    })

  }
}