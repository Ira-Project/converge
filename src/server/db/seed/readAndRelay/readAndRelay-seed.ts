/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { eq } from "drizzle-orm";
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

  const assignment = await db.insert(readAndRelayAssignments).values({
    id: assignmentId,
    name: json.name,
    readingPassage: json.readingPassage,
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
    await db.insert(readAndRelayQuestions).values(questionObject)
    const answerObject = {
      id: generateId(21),
      questionId: questionId,
      answer: question.answer,
    }
    await db.insert(readAndRelayAnswers).values(answerObject)
    await db.insert(readAndRelayQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId,
      assignmentId: assignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }  

}