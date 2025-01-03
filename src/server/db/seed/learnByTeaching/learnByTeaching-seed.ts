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

import json from "./work_energy_power.json";

async function createQuestionsAndConceptListFromJson() {

  const topicId = "yyyah4hvk5r7188h7mgkk";

  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId),
  )
  
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
    await db.insert(explainQuestions).values(questionObject)
    const answerObject = {
      id: generateId(21),
      questionId: questionId,
      answer: question.answer,
    }
    await db.insert(explainAnswers).values(answerObject)
  }
}

async function addQuestionsToAssignmentFromTopic() {

  // Parameters for assignment creation
  const topicId = "yyyah4hvk5r7188h7mgkk";
  const assignmentId = "9pcpaym65ccyj9rtlz6xd";

  const existingQuestions = await db.select().from(explainQuestionToAssignment).where(
    eq(explainQuestionToAssignment.assignmentId, assignmentId),
  )
  if(existingQuestions.length > 0) {
    console.log("Assignment already has questions")
    return
  }

  const questionList = await db.select().from(explainQuestions).where(
    eq(explainQuestions.topicId, topicId),
  )

  for (const question of questionList) {
    await db.insert(explainQuestionToAssignment).values({
      id: generateId(21),
      questionId: question.id,
      assignmentId: assignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

}