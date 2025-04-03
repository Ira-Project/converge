/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { eq, and } from "drizzle-orm";
import { generateId } from "lucia";
import { explainAnswers, explainQuestionConcepts, explainQuestions, explainQuestionToAssignment } from "../../schema/learnByTeaching/explainQuestions";

import { topics } from "../../schema/subject";

type QuestionType = {
  id: string,
  question: string,
  lambdaUrl: string,
  topicId: string,
  image: string,
} 

import json from "./electric_charge.json";
import { explainAssignments } from "../../schema/learnByTeaching/explainAssignment";
import { ActivityType } from "@/lib/constants";
import { activity, activityToAssignment } from "../../schema/activity";
import { classrooms } from "../../schema/classroom";
import { concepts } from "../../schema/concept";

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
      const activityId = generateId(21);
      await db.insert(activity).values({
        id: activityId,
        assignmentId: assignmentId,
        classroomId: classroom.id,
        name: json.name,
        topicId: topicId,
        typeText: ActivityType.LearnByTeaching,
        order: 0,
        points: 100,
      })
      await db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activityId,
        learnByTeachingAssignmentId: assignmentId,
      })
      console.log("Created activity for classroom:", classroom.id);
    }
  }
  console.log("Learn By Teaching assignment creation completed");
  console.log("-------------------------");
}

export async function addConceptsToQuestions() {
  const questions = await db.select().from(explainQuestions);
  for(const question of json.questions) {
    const questionObject = questions.find((q) => q.lambdaUrl === question.lambda_url);
    if(questionObject) {
      console.log("Question:", questionObject.id, "->", question.concepts);
      for(const concept of question.concepts) {
        const conceptObject = await db.select().from(concepts).where(eq(concepts.text, concept));
        if(conceptObject?.[0]) {
          console.log("Concept:", conceptObject[0].id, "->", concept);
          const existingConcept = await db.select().from(explainQuestionConcepts).where(
            and(
              eq(explainQuestionConcepts.questionId, questionObject.id),
              eq(explainQuestionConcepts.conceptId, conceptObject[0].id)
            )
          )
          if(existingConcept.length === 0) {
            await db.insert(explainQuestionConcepts).values({
              id: generateId(21),
              questionId: questionObject.id,
              conceptId: conceptObject[0].id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          } else {
            console.log("Concept already exists:", conceptObject[0].id, "->", concept);
          }
        } else {
          console.log("Concept not found, creating concept:", concept);
          const conceptId = generateId(21);
          await db.insert(concepts).values({
            id: conceptId,
            text: concept,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          console.log("Created concept:", concept);
          await db.insert(explainQuestionConcepts).values({
            id: generateId(21),
            questionId: questionObject.id,
            conceptId: conceptId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }
    }
  }
}