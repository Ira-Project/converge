/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";


import reasoningJson from "./thermal_energy_transfers.json";
import { reasoningAnswerOptions, reasoningPathway, reasoningPathwayStep, reasoningQuestions, reasoningQuestionToAssignment } from "../../schema/reasoning/reasoningQuestions";
import { reasoningAssignmentAttempts, reasoningAssignments, } from "../../schema/reasoning/reasoningAssignment";
import { activity } from "../../schema/activity";
import { classrooms } from "../../schema/classroom";
import { ActivityType } from "@/lib/constants";
import { reasoningPathwayAttempts, reasoningAttemptFinalAnswer, reasoningPathwayAttemptSteps } from "../../schema/reasoning/reasoningQuestionAttempts";

export async function createReasoningAssignment() {
  // Parameters for assignment creation
  const topicId = process.env.ENVIRONMENT === "prod" ? reasoningJson.topicIdProd : reasoningJson.topicIdDev;
  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId),
  )

  if (topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }
  const assignmentName = reasoningJson.name;

  // Check if assignment already exists
  const existingAssignment = await db.select().from(reasoningAssignments).where(
    and(
      eq(reasoningAssignments.topicId, topicId),
      eq(reasoningAssignments.name, assignmentName)
    )
  );

  if (existingAssignment?.[0]?.id !== undefined) {
    console.log(`Assignment "${assignmentName}" already exists`)
    return
  }

  const assignmentId = generateId(21);

  // Create the assignment
  console.log("Creating reasoning assignment", assignmentName);
  await db.insert(reasoningAssignments).values({
    id: assignmentId,
    topicId: topicId,
    name: assignmentName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });


  for (const reasoningQuestion of reasoningJson.reasoningQuestions) {
    // Check if question already exists
    const existingQuestion = await db.select().from(reasoningQuestions).where(
      and(
        eq(reasoningQuestions.questionText, reasoningQuestion.questionText),
        eq(reasoningQuestions.topicId, topicId),
        eq(reasoningQuestions.topText, reasoningQuestion.topText)
      )
    )
    let questionId: string;
    if (existingQuestion?.[0]?.id !== undefined) {
      console.log(`Question "${reasoningQuestion.questionText.substring(0, 30)}..." already exists`)
      questionId = existingQuestion[0].id;
    } else {
      // Create the reasoning question
      console.log("Creating reasoning question", reasoningQuestion.questionText.substring(0, 30));
      questionId = generateId(21)
      await db.insert(reasoningQuestions).values({
        id: questionId,
        questionText: reasoningQuestion.questionText,
        questionImage: reasoningQuestion.questionImage,
        topText: reasoningQuestion?.topText,
        // topImage: reasoningQuestion?.topImage,
        answerText: reasoningQuestion.answerText,
        correctAnswers: reasoningQuestion.correctAnswers,
        answerImage: reasoningQuestion.answerImage,
        numberOfSteps: reasoningQuestion.numberOfSteps,
        topicId: topicId,
      })
    }

    // Check and create answer options
    for (const option of reasoningQuestion.answerOptions) {
      const existingOption = await db.select().from(reasoningAnswerOptions).where(
        and(
          eq(reasoningAnswerOptions.questionId, questionId),
          eq(reasoningAnswerOptions.id, option.id)
        )
      )

      if (existingOption?.[0]?.id === undefined) {
        console.log("Creating reasoning answer option", option.optionText.substring(0, 30));
        await db.insert(reasoningAnswerOptions).values({
          id: option.id,
          questionId: questionId,
          optionText: option.optionText,
          optionImage: option.optionImage,
        })
      }
    }

    // Check and create pathways and steps
    for (const pathway of reasoningQuestion.pathways) {
      // Check if a similar pathway exists by comparing its steps
      const existingPathways = await db.select().from(reasoningPathway).where(
        eq(reasoningPathway.questionId, questionId)
      )

      let pathwayExists = false;
      for (const existingPathway of existingPathways) {
        const existingSteps = await db.select().from(reasoningPathwayStep).where(
          eq(reasoningPathwayStep.pathwayId, existingPathway.id)
        )

        if (existingSteps.length > 0) {
          pathwayExists = true;
          break;
        }
      }

      if (!pathwayExists) {
        const pathwayId = generateId(21)
        console.log("Creating reasoning pathway", pathwayId);
        await db.insert(reasoningPathway).values({
          id: pathwayId,
          questionId: questionId,
        })

        // Create the steps for this pathway
        for (const step of pathway.steps) {
          // Check if the step already exists
          const existingStep = await db.select().from(reasoningPathwayStep).where(
            and(
              eq(reasoningPathwayStep.pathwayId, pathwayId),
              eq(reasoningPathwayStep.answerOptionId, step.answerOptionId)
            )
          )

          if (existingStep?.[0]?.id === undefined) {
            console.log("Creating reasoning pathway step", step.stepNumber);
            await db.insert(reasoningPathwayStep).values({
              id: generateId(21),
              pathwayId: pathwayId,
              answerOptionId: step.answerOptionId,
              stepNumber: step.stepNumber,
              // stepNumberList: step?.stepNumberList ?? [],
              isCorrect: step.isCorrect,
              replacementOptionId: step.replacementOptionId,
            })
          }
        }
      }
    }

    console.log("Creating reasoning question to assignment", questionId, assignmentId);
    await db.insert(reasoningQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId,
      assignmentId: assignmentId,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const classes = await db.select().from(classrooms);
  for (const classroom of classes) {
    // Check if activity already exists in the classroom
    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.assignmentId, assignmentId),
        eq(activity.classroomId, classroom.id)
      )
    )

    // If activity does not exist, create it
    if (existingActivity.length === 0) {
      console.log("Adding assignment to classroom. Creating activity", assignmentId, classroom.id);
      await db.insert(activity).values({
        id: generateId(21),
        assignmentId: assignmentId,
        classroomId: classroom.id,
        name: assignmentName,
        topicId: topicId,
        type: ActivityType.ReasonTrace,
        order: 0,
        points: 100,
      })
    }
  }

  console.log("Reasoning creation complete");
  console.log("--------------------------------");

}

export async function deleteReasoningAssignment(assignmentId: string) {

  // First get the reasoning assignment
  const reasoningAssignment = await db.select().from(reasoningAssignments).where(eq(reasoningAssignments.id, assignmentId));
  if (reasoningAssignment.length === 0) {
    console.log("Reasoning assignment not found");
    return;
  }

  const questionsToAssignment = await db.select().from(reasoningQuestionToAssignment).where(eq(reasoningQuestionToAssignment.assignmentId, assignmentId));
  for (const questionToAssignment of questionsToAssignment) {

    const question = await db.select().from(reasoningQuestions).where(eq(reasoningQuestions.id, questionToAssignment.questionId));

    if (!question[0]?.id) {
      console.log("Question not found", questionToAssignment.questionId);
      continue;
    }

    const answerOptions = await db.select().from(reasoningAnswerOptions).where(eq(reasoningAnswerOptions.questionId, question[0].id));
    for (const answerOption of answerOptions) {

      const pathwaySteps = await db.select().from(reasoningPathwayStep).where(eq(reasoningPathwayStep.answerOptionId, answerOption.id));
      for (const pathwayStep of pathwaySteps) {
        console.log("Deleting pathway step", pathwayStep.stepNumber);
        await db.delete(reasoningPathwayStep).where(eq(reasoningPathwayStep.id, pathwayStep.id));
      }

      console.log("Deleting pathway attempt steps", answerOption.optionText.substring(0, 30));
      await db.delete(reasoningPathwayAttemptSteps).where(eq(reasoningPathwayAttemptSteps.reasoningOptionId, answerOption.id));
    }

    for (const answerOption of answerOptions) {
      console.log("Deleting answer option", answerOption.optionText.substring(0, 30));
      await db.delete(reasoningAnswerOptions).where(eq(reasoningAnswerOptions.id, answerOption.id));
    }

    console.log("Deleting reasoning pathway", question[0].questionText?.substring(0, 30));
    await db.delete(reasoningPathway).where(eq(reasoningPathway.questionId, question[0].id));

    console.log("Deleting final answers for", question[0].questionText?.substring(0, 30));
    await db.delete(reasoningAttemptFinalAnswer).where(eq(reasoningAttemptFinalAnswer.questionId, question[0].id));

    console.log("Deleting question attempts for", question[0].questionText?.substring(0, 30));
    await db.delete(reasoningPathwayAttempts).where(eq(reasoningPathwayAttempts.questionId, question[0].id));

    console.log("Deleting question to assignment", questionToAssignment.id);
    await db.delete(reasoningQuestionToAssignment).where(eq(reasoningQuestionToAssignment.id, questionToAssignment.id));

    console.log("Deleting questions", question[0].questionText?.substring(0, 30));
    await db.delete(reasoningQuestions).where(eq(reasoningQuestions.id, question[0].id));
  }

  const activities = await db.select().from(activity).where(eq(activity.assignmentId, assignmentId));
  for (const act of activities) {

    // Delete the reasoning assignment attempts
    console.log("Deleting reasoning assignment attempts", act.id);
    await db.delete(reasoningAssignmentAttempts).where(eq(reasoningAssignmentAttempts.activityId, act.id));

    // Delete the activity
    console.log("Deleting activity", act.id);
    await db.delete(activity).where(eq(activity.id, act.id));
  }

  // Delete the reasoning assignment
  console.log("Deleting reasoning assignment", assignmentId);
  await db.delete(reasoningAssignments).where(eq(reasoningAssignments.id, assignmentId));

  console.log("Reasoning assignment deletion complete");
  console.log("--------------------------------");
}