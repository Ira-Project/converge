/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";
import { classrooms } from "../../schema/classroom";

import stepSolve from "./thermal_energy_transfers.json";
import { stepSolveQuestions, stepSolveQuestionToAssignment, stepSolveStep, stepSolveStepOptions } from "../../schema/stepSolve/stepSolveQuestions";
import { stepSolveAssignmentAttempts, stepSolveAssignments } from "../../schema/stepSolve/stepSolveAssignment";
import { stepSolveQuestionAttempts, stepSolveQuestionAttemptSteps } from "../../schema/stepSolve/stepSolveQuestionAttempts";
import { activity } from "../../schema/activity";
import { ActivityType } from "@/lib/constants";

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
    console.log("Creating step solve assignment");
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
      // Create the step solve question
      console.log("Creating step solve question", stepSolveQuestion.questionText.substring(0, 30));
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
        console.log("Creating step solve step", step.stepText.substring(0, 30));
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
        console.log("Creating step solve step option", option.optionText.substring(0, 30));
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

    console.log("Creating step solve question to assignment", questionId, stepSolveAssignment.id);
    await db.insert(stepSolveQuestionToAssignment).values({
      id: generateId(21),
      assignmentId: stepSolveAssignment.id,
      questionId: questionId,
    })

  }

  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    // Check if activity already exists in the classroom
    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.assignmentId, stepSolveAssignment.id),
        eq(activity.classroomId, classroom.id)
      )
    )

    // If activity does not exist, create it
    if(existingActivity.length === 0) {
      console.log("Adding assignment to classroom. Creating activity", stepSolveAssignment.id, classroom.id);
      await db.insert(activity).values({
        id: generateId(21),
        assignmentId: stepSolveAssignment.id,
        classroomId: classroom.id,
        name: stepSolve.name,
        topicId: topicId,
        type: ActivityType.StepSolve,
        order: 0,
        points: 100,
      })
    }
  }

  console.log("Step solve creation complete");
  console.log("--------------------------------");
}

export async function deleteStepSolveAssignment(stepSolveAssignmentId: string) {
  //First get the step solve assignment
  const stepSolveAssignment = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.id, stepSolveAssignmentId));
  if (stepSolveAssignment.length === 0) {
    console.log("Step solve assignment not found");
    return;
  }

  const stepSolveQuestionsToAssignment = await db.select().from(stepSolveQuestionToAssignment).where(eq(stepSolveQuestionToAssignment.assignmentId, stepSolveAssignmentId));

  for (const questionToAssignment of stepSolveQuestionsToAssignment) {
    const question = await db.select().from(stepSolveQuestions).where(eq(stepSolveQuestions.id, questionToAssignment.questionId));

    
    console.log("Deleting question to assignment", questionToAssignment.id);
    await db.delete(stepSolveQuestionToAssignment).where(eq(stepSolveQuestionToAssignment.id, questionToAssignment.id));

    if (question[0]?.id) {
      const steps = await db.select().from(stepSolveStep).where(eq(stepSolveStep.questionId, question[0].id));

      //Delete the steps and options
      for (const step of steps) {
        
        const stepAttempts = await db.select().from(stepSolveQuestionAttemptSteps).where(eq(stepSolveQuestionAttemptSteps.stepSolveStepId, step.id));

        for (const attempt of stepAttempts) {
          console.log("Deleting step attempt", attempt.id);
          await db.delete(stepSolveQuestionAttemptSteps).where(eq(stepSolveQuestionAttemptSteps.id, attempt.id));
        }

        const stepOptions = await db.select().from(stepSolveStepOptions).where(eq(stepSolveStepOptions.stepId, step.id));
        for (const option of stepOptions) {
          console.log("Deleting step option", option.id, option.optionText);
          await db.delete(stepSolveStepOptions).where(eq(stepSolveStepOptions.id, option.id));
        }

        console.log("Deleting step", step.id, step.stepText);
        await db.delete(stepSolveStep).where(eq(stepSolveStep.id, step.id));

      }

      //Delete the question attempts
      console.log("Deleting question attempts", question[0].id);
      await db.delete(stepSolveQuestionAttempts).where(eq(stepSolveQuestionAttempts.questionId, question[0].id));
      console.log("Deleting question", question[0].id, question[0].questionText);
      await db.delete(stepSolveQuestions).where(eq(stepSolveQuestions.id, question[0].id));
    }
  }

  // Delete the assignment
  console.log("Deleting assignment", stepSolveAssignmentId);
  await db.delete(stepSolveAssignments).where(eq(stepSolveAssignments.id, stepSolveAssignmentId));

  const activities = await db.select().from(activity).where(eq(activity.assignmentId, stepSolveAssignmentId));
  for (const act of activities) {
    if(act.type !== ActivityType.StepSolve) {
      console.log("Activity is not step solve, skipping");
      continue;
    }

    if(!act.id) {
      console.log("Activity id not found");
      continue;
    }

    //Delete the step solve assignment attempts
    console.log("Deleting step solve assignment attempts", act.id);
    await db.delete(stepSolveAssignmentAttempts).where(eq(stepSolveAssignmentAttempts.activityId, act.id));

    //Delete the activity
    console.log("Deleting activity", act.id);
    await db.delete(activity).where(eq(activity.id, act.id));
  } 

  console.log("Step solve deletion complete");
  console.log("--------------------------------");

}
