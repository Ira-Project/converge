/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { explainAnswers, explainQuestions, explainQuestionToAssignment } from "../../schema/learnByTeaching/explainQuestions";

import { topics } from "../../schema/subject";

type QuestionType = {
  id: string,
  question: string,
  lambdaUrl: string,
  topicId: string,
  image: string,
} 

import json from "./sample.json";
import { readAndRelayAssignments } from "../../schema/readAndRelay/readAndRelayAssignments";
import { readAndRelayAnswers, readAndRelayQuestions, readAndRelayQuestionToAssignment } from "../../schema/readAndRelay/readAndRelayQuestions";
import { activity } from "../../schema/activity";
import { classrooms } from "../../schema/classroom";
import { ActivityType } from "@/lib/constants";
import { knowledgeZapAssignments } from "../../schema/knowledgeZap/knowledgeZapAssignment";
import { readAndRelayAttempts, readAndRelayCheatSheets, readAndRelayComputedAnswers } from "../../schema/readAndRelay/readAndRelayAttempts";

export async function createReadAndRelayAssignment() {

  const topicId = process.env.ENVIRONMENT === "prod" ? json.topicIdProd : json.topicIdDev;

  const assignmentId = generateId(21)

  const existingAssignment = await db.select().from(readAndRelayAssignments).where(
    eq(readAndRelayAssignments.topicId, topicId),
  )

  if(existingAssignment.length > 0) {
    console.log("Assignment already exists")
    return
  }


  // Create the assignment object
  await db.insert(readAndRelayAssignments).values({
    id: assignmentId,
    name: json.name,
    readingPassage: json.readingPassage,
    maxNumberOfHighlights: json.maxNumberOfHighlights,
    maxNumberOfFormulas: json.maxNumberOfFormulas,
    maxHighlightLength: json.maxHighlightLength,
    maxFormulaLength: json.maxFormulaLength,
    description: "Read and Relay",
    topicId: topicId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const existingQuestions = await db.select().from(readAndRelayQuestionToAssignment).where(
    eq(readAndRelayQuestionToAssignment.assignmentId, assignmentId), 
  )
  if(existingQuestions.length > 0) {
    console.log("Assignment already has questions")
    return
  }

  // Create the questions object
  for (const question of json.questions) {
    const questionId = generateId(21)
    const questionObject:QuestionType = {
      id: questionId,
      question: question.question,
      lambdaUrl: question.lambda_url,
      topicId: topicId,
      image: question.image,
    }
    console.log("Creating question", questionObject.question.substring(0, 30))
    await db.insert(readAndRelayQuestions).values(questionObject)
    const answerObject = {
      id: generateId(21),
      questionId: questionId,
      answer: question.answer,
    }
    console.log("Creating answer", answerObject.answer.substring(0, 30))
    await db.insert(readAndRelayAnswers).values(answerObject)
    console.log("Creating question to assignment", questionId, assignmentId)
    await db.insert(readAndRelayQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId,
      assignmentId: assignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }  

  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    // Check if activity already exists in the classroom
    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.assignmentId, assignmentId),
        eq(activity.classroomId, classroom.id)
      )
    )

    // If activity does not exist, create it
    if(existingActivity.length === 0) {
      console.log("Adding assignment to classroom. Creating activity", assignmentId, classroom.id);
      await db.insert(activity).values({
        id: generateId(21),
        assignmentId: assignmentId,
        classroomId: classroom.id,
        name: json.name,
        topicId: topicId,
        type: ActivityType.ReadAndRelay,
        order: 0,
        points: 100,
      })
    }
  }

  console.log("Read and Relay creation complete");
  console.log("--------------------------------");

}

export async function deleteReadAndRelayAssignment(assignmentId: string) {

  const assignment = await db.select().from(readAndRelayAssignments).where(
    eq(readAndRelayAssignments.id, assignmentId),
  )

  if(assignment.length === 0) {
    console.log("Assignment not found")
    return 
  }

  const activities = await db.select().from(activity).where(eq(activity.assignmentId, assignmentId));

  for(const act of activities) {
    console.log("Deleting read and relay assignment attempts", act.id);
    const attempts = await db.select().from(readAndRelayAttempts).where(eq(readAndRelayAttempts.activityId, act.id));
    for(const attempt of attempts) {

      const cheatSheets = await db.select().from(readAndRelayCheatSheets).where(eq(readAndRelayCheatSheets.attemptId, attempt.id));
      for(const cheatSheet of cheatSheets) {

        console.log("Deleting read and relay computed answers", cheatSheet.id);
        await db.delete(readAndRelayComputedAnswers).where(eq(readAndRelayComputedAnswers.cheatsheetId, cheatSheet.id));

        console.log("Deleting read and relay cheat sheet", cheatSheet.id);
        await db.delete(readAndRelayCheatSheets).where(eq(readAndRelayCheatSheets.id, cheatSheet.id));
      }

      console.log("Deleting read and relay assignment attempt", attempt.id);
      await db.delete(readAndRelayAttempts).where(eq(readAndRelayAttempts.id, attempt.id));
    }
  }

  const questionsToAssignment = await db.select().from(readAndRelayQuestionToAssignment).where(
    eq(readAndRelayQuestionToAssignment.assignmentId, assignmentId),
  )

  for(const questionToAssignment of questionsToAssignment) {

    const question = await db.select().from(readAndRelayQuestions).where(
      eq(readAndRelayQuestions.id, questionToAssignment.questionId),
    )

    if(!question[0]?.id) {
      console.log("Question not found", questionToAssignment.questionId);
      continue;
    }

    console.log("Deleting answer", question[0].question.substring(0, 30));
    await db.delete(readAndRelayAnswers).where(eq(readAndRelayAnswers.questionId, question[0].id));

    console.log("Deleting question to assignment", questionToAssignment.id);
    await db.delete(readAndRelayQuestionToAssignment).where(eq(readAndRelayQuestionToAssignment.id, questionToAssignment.id));

    console.log("Deleting question", question[0].question.substring(0, 30));
    await db.delete(readAndRelayQuestions).where(eq(readAndRelayQuestions.id, question[0].id));
  }


  for(const act of activities) {
    console.log("Deleting activity", act.id);
    await db.delete(activity).where(eq(activity.id, act.id));
  }

  console.log("Deleting assignment", assignmentId);
  await db.delete(readAndRelayAssignments).where(eq(readAndRelayAssignments.id, assignmentId));

  console.log("Read and Relay deletion complete");
  console.log("--------------------------------");


}
