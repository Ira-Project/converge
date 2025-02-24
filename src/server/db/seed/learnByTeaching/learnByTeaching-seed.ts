/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { eq, and } from "drizzle-orm";
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

import json from "./radioactive_decay.json";
import { explainAssignments } from "../../schema/learnByTeaching/explainAssignment";
import { ActivityType } from "@/lib/constants";
import { activity } from "../../schema/activity";
import { classrooms } from "../../schema/classroom";

export async function createLearnByTeachingAssignment() {

  const topicId = process.env.ENVIRONMENT === "prod" ? json.topicIdProd : json.topicIdDev;

  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId),
  )

  if (topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }

  const assignmentId = generateId(21);
  await db.insert(explainAssignments).values({
    id: assignmentId,
    name: json.name,
    topicId: topicId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log("Created explain assignment");
  
  // Create the questions object
  console.log("Starting question creation for", json.questions.length, "questions");
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
    console.log("Created question:", questionId);

    const answerObject = {
      id: generateId(21),
      questionId: questionId,
      answer: question.answer,
    }
    await db.insert(explainAnswers).values(answerObject)
    console.log("Created answer for question:", questionId);

    await db.insert(explainQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId,
      assignmentId: assignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log("Linked question to assignment:", questionId, "->", assignmentId);
  }

  console.log("Adding assignment to all classrooms");
  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    // Check if activity already exists in the classroom
    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.assignmentId, assignmentId),
        eq(activity.classroomId, classroom.id)
      )
    )
    console.log("Existing activity check for classroom", classroom.id, ":", existingActivity.length > 0 ? "exists" : "does not exist");

    // If activity does not exist, create it
    if(existingActivity.length === 0) {
      console.log("Adding assignment to classroom. Creating activity", assignmentId, classroom.id);
      await db.insert(activity).values({
        id: generateId(21),
        assignmentId: assignmentId,
        classroomId: classroom.id,
        name: json.name,
        topicId: topicId,
        type: ActivityType.LearnByTeaching,
        typeText: ActivityType.LearnByTeaching,
        order: 0,
        points: 100,
      })
      console.log("Created activity for classroom:", classroom.id);
    }
  }
  console.log("Learn By Teaching assignment creation completed");
  console.log("-------------------------");
}