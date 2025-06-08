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
import { 
  explainAssignments,
  explainAssignmentToCourse,
  explainAssignmentToGrade,
  explainAssignmentToSubject
} from "../../schema/learnByTeaching/explainAssignment";
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

export async function deleteLearnByTeachingAssignment(assignmentId: string) {
  const assignment = await db.select().from(explainAssignments).where(eq(explainAssignments.id, assignmentId));
  if(assignment.length === 0) {
    console.log("Learn by teaching assignment not found");
    return;
  }

  // Delete associated assignment-to-course mappings
  console.log("Deleting learn by teaching assignment to course mappings", assignmentId);
  await db.delete(explainAssignmentToCourse).where(eq(explainAssignmentToCourse.assignmentId, assignmentId));

  // Delete associated assignment-to-grade mappings
  console.log("Deleting learn by teaching assignment to grade mappings", assignmentId);
  await db.delete(explainAssignmentToGrade).where(eq(explainAssignmentToGrade.assignmentId, assignmentId));

  // Delete associated assignment-to-subject mappings
  console.log("Deleting learn by teaching assignment to subject mappings", assignmentId);
  await db.delete(explainAssignmentToSubject).where(eq(explainAssignmentToSubject.assignmentId, assignmentId));

  const questionsToAssignment = await db.select().from(explainQuestionToAssignment).where(eq(explainQuestionToAssignment.assignmentId, assignmentId));
  for(const questionToAssignment of questionsToAssignment) {

    const question = await db.select().from(explainQuestions).where(eq(explainQuestions.id, questionToAssignment.questionId));

    if(!question[0]?.id) {
      console.log("Question not found", questionToAssignment.questionId);
      continue;
    }

    console.log("Deleting explain question concepts", question[0].question.substring(0, 30));
    await db.delete(explainQuestionConcepts).where(eq(explainQuestionConcepts.questionId, question[0].id));

    console.log("Deleting explain answers", question[0].question.substring(0, 30));
    await db.delete(explainAnswers).where(eq(explainAnswers.questionId, question[0].id));

    console.log("Deleting explain question to assignment", questionToAssignment.id);
    await db.delete(explainQuestionToAssignment).where(eq(explainQuestionToAssignment.id, questionToAssignment.id));

    console.log("Deleting explain question", question[0].question.substring(0, 30));
    await db.delete(explainQuestions).where(eq(explainQuestions.id, question[0].id));
  }

  console.log("Deleting activity to assignment", assignmentId);
  await db.delete(activityToAssignment).where(eq(activityToAssignment.learnByTeachingAssignmentId, assignmentId));

  const activities = await db.select().from(activity).where(eq(activity.assignmentId, assignmentId));
  for(const act of activities) {
    console.log("Deleting activity", act.id);
    await db.delete(activity).where(eq(activity.id, act.id));
  }

  console.log("Deleting learn by teaching assignment", assignmentId);
  await db.delete(explainAssignments).where(eq(explainAssignments.id, assignmentId));

  console.log("Learn by teaching assignment deletion complete");
  console.log("--------------------------------");
}